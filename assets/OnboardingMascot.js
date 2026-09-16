import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Path,
  G,
  Ellipse,
  Polygon,
  Text as SvgText,
} from 'react-native-svg';

// Chubby ginger cat with glasses holding a stylus, next to a calendar card
// showing a conflict-free booking. Used on the Onboarding screen.
export default function OnboardingMascot({ width = 300, height = Math.round((300 * 320) / 380) }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 380 320" fill="none">
      <Defs>
        <LinearGradient id="bgBlob" x1="0" y1="0" x2="380" y2="320" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#FFF0EB" />
          <Stop offset="60%" stopColor="#F3EFFF" />
          <Stop offset="100%" stopColor="#FFFBEB" />
        </LinearGradient>
      </Defs>

      <Rect width="380" height="320" rx="36" fill="url(#bgBlob)" />
      <Circle cx="50" cy="60" r="18" fill="#FDE68A" opacity={0.7} />
      <Circle cx="330" cy="80" r="12" fill="#DDD6FE" opacity={0.8} />
      <Path d="M40 240 Q60 220 80 250" stroke="#FF8A65" strokeWidth="3" strokeLinecap="round" fill="none" opacity={0.4} />
      <Path d="M310 260 Q330 280 350 250" stroke="#8E7CFF" strokeWidth="3" strokeLinecap="round" fill="none" opacity={0.5} />

      {/* Calendar card */}
      <G>
        <Rect x="200" y="45" width="135" height="115" rx="18" fill="#FFFFFF" />
        <Rect x="200" y="45" width="135" height="32" rx="18" fill="#FF7A59" />
        <Rect x="200" y="65" width="135" height="12" fill="#FF7A59" />

        <Rect x="225" y="38" width="6" height="14" rx="3" fill="#26262B" />
        <Rect x="295" y="38" width="6" height="14" rx="3" fill="#26262B" />

        <SvgText x="267" y="66" textAnchor="middle" fontSize="12" fontWeight="700" fill="#FFFFFF">
          OCTOBER
        </SvgText>

        <Rect x="212" y="85" width="111" height="18" rx="6" fill="#EEF2FF" />
        <Circle cx="221" cy="94" r="3.5" fill="#4F46E5" />
        <SvgText x="230" y="98" fontSize="9" fontWeight="700" fill="#3730A3">
          10:00 • Client Kickoff
        </SvgText>

        <Rect x="212" y="108" width="111" height="18" rx="6" fill="#ECFDF5" />
        <Circle cx="221" cy="117" r="3.5" fill="#10B981" />
        <SvgText x="230" y="121" fontSize="9" fontWeight="700" fill="#065F46">
          No Double Bookings! ✓
        </SvgText>
      </G>

      {/* Mascot */}
      <G>
        <Ellipse cx="145" cy="225" rx="72" ry="68" fill="#FFA270" />
        <Ellipse cx="145" cy="240" rx="46" ry="46" fill="#FFF3ED" />

        <Ellipse cx="95" cy="285" rx="22" ry="14" fill="#FFA270" />
        <Ellipse cx="195" cy="285" rx="22" ry="14" fill="#FFA270" />
        <Circle cx="90" cy="285" r="3.5" fill="#FF7A59" />
        <Circle cx="98" cy="283" r="3.5" fill="#FF7A59" />
        <Circle cx="192" cy="283" r="3.5" fill="#FF7A59" />
        <Circle cx="200" cy="285" r="3.5" fill="#FF7A59" />

        <Polygon points="85,130 95,80 130,115" fill="#FF8C52" />
        <Polygon points="94,124 100,92 122,114" fill="#FFD1C4" />

        <Polygon points="158,115 192,82 202,130" fill="#FF8C52" />
        <Polygon points="166,115 186,94 194,124" fill="#FFD1C4" />

        <Circle cx="145" cy="150" r="58" fill="#FFA270" />

        <Rect x="106" y="132" width="34" height="28" rx="10" stroke="#26262B" strokeWidth="4" fill="#FFFFFF" fillOpacity={0.8} />
        <Rect x="150" y="132" width="34" height="28" rx="10" stroke="#26262B" strokeWidth="4" fill="#FFFFFF" fillOpacity={0.8} />
        <Path d="M140 144 Q145 140 150 144" stroke="#26262B" strokeWidth="4" strokeLinecap="round" fill="none" />

        <Circle cx="123" cy="146" r="6" fill="#26262B" />
        <Circle cx="125.5" cy="143.5" r="2.2" fill="#FFFFFF" />
        <Circle cx="167" cy="146" r="6" fill="#26262B" />
        <Circle cx="169.5" cy="143.5" r="2.2" fill="#FFFFFF" />

        <Ellipse cx="102" cy="162" rx="10" ry="6" fill="#FF7A59" opacity={0.4} />
        <Ellipse cx="188" cy="162" rx="10" ry="6" fill="#FF7A59" opacity={0.4} />

        <Polygon points="141,162 149,162 145,167" fill="#E11D48" />
        <Path d="M137 170 Q145 176 145 167 Q145 176 153 170" stroke="#26262B" strokeWidth="3" strokeLinecap="round" fill="none" />

        <Ellipse cx="118" cy="200" rx="12" ry="10" fill="#FFF3ED" />
        <Ellipse cx="172" cy="195" rx="12" ry="10" fill="#FFF3ED" />

        <Rect x="165" y="160" width="8" height="46" rx="4" transform="rotate(35 165 160)" fill="#8E7CFF" />
        <Polygon points="186,155 190,147 195,158" fill="#FCD34D" />

        <Path d="M65 170 L68 178 L76 181 L68 184 L65 192 L62 184 L54 181 L62 178 Z" fill="#F59E0B" />
        <Path d="M280 200 L282 205 L287 207 L282 209 L280 214 L278 209 L273 207 L278 205 Z" fill="#8E7CFF" />
      </G>
    </Svg>
  );
}
