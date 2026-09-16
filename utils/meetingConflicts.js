import { supabase } from '../lib/supabase';
import { pgDateTimeToTimestamp } from './dateFormat';

// Checks a candidate meeting against the user's existing non-completed
// meetings and returns the list of ones it clashes with. Plain client-side
// logic (a select + JS comparisons) — no Postgres function/RPC involved.
//
// Rules (checked both ways — existing meeting's buffer bleeding forward
// into the new one, AND the new meeting's own buffer bleeding forward into
// a later existing one):
// - Only meetings with completed = false are considered.
// - An existing meeting's buffer is its own buffer_override_minutes if set,
//   otherwise the user's default buffer. The new meeting's buffer is
//   whatever is about to be saved for it (its override, or the default).
// - If the existing meeting HAS an end_time: strict adherence — any overlap
//   between [newStart, newEnd) and [existStart, existEnd) is a conflict
//   ("overlap"). Otherwise, whichever meeting comes first is the only one
//   whose buffer is relevant: if the existing one ends first, check its
//   end + its buffer against the new meeting's start; if the new one ends
//   first, check its end + its own buffer against the existing meeting's
//   start. (A buffer only ever bleeds forward in time, so it's meaningless
//   to check it against something that already happened before it.)
// - If the existing meeting has NO end_time (it's optional), it's treated
//   as a zero-length point at its start time for this same before/after
//   comparison — there's no "overlap" case, just whichever buffer applies.
export async function checkMeetingConflicts({
  uid,
  newStart,
  newEnd,
  defaultBufferMinutes,
  newBufferMinutes,
  excludeId,
}) {
  const { data: existing, error } = await supabase
    .from('meetings')
    .select('id, client_name, meeting_date, start_time, end_time, buffer_override_minutes')
    .eq('uid', uid)
    .eq('completed', false);

  if (error) throw error;

  const conflicts = [];
  const newRangeEnd = newEnd ?? newStart;

  for (const meeting of existing ?? []) {
    if (excludeId != null && meeting.id === excludeId) continue;

    const existBufferMinutes = meeting.buffer_override_minutes ?? defaultBufferMinutes;
    const existStart = pgDateTimeToTimestamp(meeting.meeting_date, meeting.start_time);
    if (!existStart) continue;

    if (meeting.end_time) {
      const existEnd = pgDateTimeToTimestamp(meeting.meeting_date, meeting.end_time);
      const overlaps = newStart < existEnd && newRangeEnd > existStart;

      if (overlaps) {
        conflicts.push({ meeting, reason: 'overlap' });
      } else if (existEnd <= newStart) {
        // Existing meeting ends first — its own buffer is the one that matters.
        const existBufferEnd = new Date(existEnd.getTime() + existBufferMinutes * 60000);
        if (existBufferEnd > newStart) {
          conflicts.push({ meeting, reason: 'buffer' });
        }
      } else if (newRangeEnd <= existStart) {
        // New meeting ends first — its own buffer is the one that matters.
        const newBufferEnd = new Date(newRangeEnd.getTime() + newBufferMinutes * 60000);
        if (newBufferEnd > existStart) {
          conflicts.push({ meeting, reason: 'buffer' });
        }
      }
    } else if (existStart <= newRangeEnd) {
      // Existing meeting (a point) falls at or before the new one ends —
      // its buffer is the one that matters.
      const existBufferEnd = new Date(existStart.getTime() + existBufferMinutes * 60000);
      if (existBufferEnd > newStart) {
        conflicts.push({ meeting, reason: 'buffer' });
      }
    } else {
      // Existing meeting's point comes after the new one ends — the new
      // meeting's own buffer is the one that matters.
      const newBufferEnd = new Date(newRangeEnd.getTime() + newBufferMinutes * 60000);
      if (newBufferEnd > existStart) {
        conflicts.push({ meeting, reason: 'buffer' });
      }
    }
  }

  return conflicts;
}
