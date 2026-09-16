import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Ellipse,
  Path,
  G,
  Text as SvgText,
} from 'react-native-svg';

// Snoozing cat curled on a cushion next to a clipboard "in review" badge.
// Used on the Gatekeeping / Awaiting Approval screen.
export default function AwaitingApprovalMascot({ width = 260, height = Math.round((260 * 320) / 380) }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 380 320" fill="none">
      <Defs>
        <LinearGradient id="waitBg" x1="0" y1="0" x2="380" y2="320" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#F5F3FF" />
          <Stop offset="50%" stopColor="#FFF7ED" />
          <Stop offset="100%" stopColor="#FEF3C7" />
        </LinearGradient>
      </Defs>

      <Rect width="380" height="320" rx="36" fill="url(#waitBg)" />

      <Circle cx="190" cy="160" r="110" stroke="#8E7CFF" strokeWidth="1.5" strokeDasharray="6 8" opacity={0.25} />
      <Circle cx="190" cy="160" r="130" stroke="#FF7A59" strokeWidth="1.5" strokeDasharray="4 10" opacity={0.2} />

      <Ellipse cx="190" cy="245" rx="100" ry="32" fill="#8E7CFF" fillOpacity={0.15} />
      <Ellipse cx="190" cy="240" rx="88" ry="24" fill="#FFFFFF" />
      <Path d="M120 240 Q190 252 260 240" stroke="#E0E7FF" strokeWidth="3" strokeLinecap="round" />

      <G>
        <Ellipse cx="190" cy="205" rx="60" ry="46" fill="#FFA270" />
        <Ellipse cx="185" cy="215" rx="38" ry="30" fill="#FFF3ED" />

        <Path
          d="M240 215 C275 220, 275 170, 250 165 C240 163, 235 175, 245 185"
          stroke="#FFA270"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M255 170 C248 165, 240 172, 245 180"
          stroke="#FFF3ED"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />

        <Circle cx="150" cy="175" r="44" fill="#FFA270" />

        <Path d="M112,150 L110,110 L136,135 Z" fill="#FF8C52" />
        <Path d="M116,146 L115,120 L132,136 Z" fill="#FFD1C4" />
        <Path d="M152,136 L172,112 L180,150 Z" fill="#FF8C52" />
        <Path d="M156,138 L168,122 L174,146 Z" fill="#FFD1C4" />

        <Path d="M130 172 Q137 180 144 172" stroke="#26262B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <Path d="M154 172 Q161 180 168 172" stroke="#26262B" strokeWidth="3.5" strokeLinecap="round" fill="none" />

        <Ellipse cx="122" cy="183" rx="7" ry="4.5" fill="#FF7A59" opacity={0.45} />
        <Ellipse cx="174" cy="183" rx="7" ry="4.5" fill="#FF7A59" opacity={0.45} />

        <Path d="M146,180 L152,180 L149,184 Z" fill="#E11D48" />
        <Path d="M144 186 Q149 190 149 184 Q149 190 154 186" stroke="#26262B" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        <SvgText x="110" y="115" fontSize="18" fontWeight="800" fill="#8E7CFF">
          z
        </SvgText>
        <SvgText x="95" y="95" fontSize="24" fontWeight="800" fill="#8E7CFF" opacity={0.8}>
          Z
        </SvgText>
        <SvgText x="80" y="70" fontSize="30" fontWeight="800" fill="#FF7A59" opacity={0.9}>
          Z
        </SvgText>

        <G transform="translate(230, 85)">
          <Rect x="0" y="0" width="70" height="90" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
          <Rect x="20" y="-6" width="30" height="12" rx="4" fill="#26262B" />

          <Rect x="12" y="20" width="46" height="6" rx="3" fill="#E2E8F0" />
          <Rect x="12" y="32" width="36" height="6" rx="3" fill="#E2E8F0" />

          <Rect x="10" y="48" width="50" height="24" rx="12" fill="#FEF3C7" />
          <SvgText x="35" y="64" textAnchor="middle" fontSize="10" fontWeight="800" fill="#B45309">
            REVIEW
          </SvgText>

          <Circle cx="58" cy="72" r="12" fill="#8E7CFF" />
          <Circle cx="58" cy="72" r="7" fill="#FFFFFF" />
          <Path d="M64 78 L72 86" stroke="#8E7CFF" strokeWidth="4" strokeLinecap="round" />
        </G>
      </G>
    </Svg>
  );
}
