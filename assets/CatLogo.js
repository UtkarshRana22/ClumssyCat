import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Polygon,
  Ellipse,
  Path,
  Circle,
  Line,
} from 'react-native-svg';

// ClumssyCat app logo/mascot badge (squircle, coral gradient, winking cat face).
export default function CatLogo({ size = 40 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Defs>
        <LinearGradient id="catGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#FF7A59" />
          <Stop offset="100%" stopColor="#FF5238" />
        </LinearGradient>
        <LinearGradient id="innerEar" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FFD1C4" />
          <Stop offset="100%" stopColor="#FFA894" />
        </LinearGradient>
      </Defs>
      <Rect width="120" height="120" rx="36" fill="url(#catGrad)" />

      <Polygon points="26,46 40,16 56,36" fill="#FFFFFF" />
      <Polygon points="32,42 42,24 50,36" fill="url(#innerEar)" />

      <Polygon points="64,36 80,16 94,46" fill="#FFFFFF" />
      <Polygon points="70,36 78,24 88,42" fill="url(#innerEar)" />

      <Ellipse cx="60" cy="66" rx="42" ry="36" fill="#FFFFFF" />

      <Ellipse cx="34" cy="74" rx="8" ry="5" fill="#FFE3DC" />
      <Ellipse cx="86" cy="74" rx="8" ry="5" fill="#FFE3DC" />

      <Path d="M38 65 Q45 58 52 65" stroke="#26262B" strokeWidth="4" strokeLinecap="round" fill="none" />

      <Circle cx="75" cy="63" r="6.5" fill="#26262B" />
      <Circle cx="77.5" cy="60.5" r="2.2" fill="#FFFFFF" />

      <Polygon points="56,72 64,72 60,76" fill="#FF7A59" />
      <Path d="M54 78 Q60 83 60 76 Q60 83 66 78" stroke="#26262B" strokeWidth="3.5" strokeLinecap="round" fill="none" />

      <Line x1="20" y1="68" x2="30" y2="70" stroke="#E2DFD8" strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="18" y1="76" x2="29" y2="76" stroke="#E2DFD8" strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="100" y1="68" x2="90" y2="70" stroke="#E2DFD8" strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="102" y1="76" x2="91" y2="76" stroke="#E2DFD8" strokeWidth="2.5" strokeLinecap="round" />

      <Circle cx="60" cy="102" r="10" fill="#8E7CFF" />
      <Rect x="55" y="98" width="10" height="8" rx="2" fill="#FFFFFF" />
      <Circle cx="58" cy="102" r="1" fill="#8E7CFF" />
      <Circle cx="62" cy="102" r="1" fill="#8E7CFF" />
    </Svg>
  );
}
