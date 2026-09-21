import Sparrow from './Sparrow.jsx'

/** Seasonal illustration layer — silhouettes in the active palette, not photos. */
export default function SeasonScenery({ season, colors, accent, highlight, bodyBg }) {
  const [far, mid, near] = colors
  const snow = highlight || accent

  return (
    <>
      <div className="season-scenery" data-season={season} aria-hidden="true">
        <svg
          className="season-scenery__svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMin slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`sky-${season}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={mid} stopOpacity="0.5" />
              <stop offset="38%" stopColor={bodyBg} stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`fade-${season}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={bodyBg} stopOpacity="0" />
              <stop offset="58%" stopColor={bodyBg} stopOpacity="0" />
              <stop offset="88%" stopColor={bodyBg} stopOpacity="0.5" />
              <stop offset="100%" stopColor={bodyBg} stopOpacity="0.95" />
            </linearGradient>
            <radialGradient id={`glow-${season}`} cx="70%" cy="14%" r="40%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.3" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`fuji-snow-${season}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={snow} stopOpacity="0.95" />
              <stop offset="100%" stopColor={snow} stopOpacity="0.35" />
            </linearGradient>
          </defs>

          <rect width="1440" height="900" fill={`url(#sky-${season})`} />
          <rect width="1440" height="900" fill={`url(#glow-${season})`} />

          {season === 'winter' && <WinterScene far={far} mid={mid} near={near} snow={snow} accent={accent} />}
          {season === 'spring' && (
            <SpringScene far={far} mid={mid} near={near} snow={snow} accent={accent} season={season} />
          )}
          {season === 'summer' && <SummerScene far={far} mid={mid} near={near} snow={snow} accent={accent} />}
          {season === 'autumn' && <AutumnScene far={far} mid={mid} near={near} snow={snow} accent={accent} />}

          <rect width="1440" height="900" fill={`url(#fade-${season})`} />
        </svg>
      </div>
      {season === 'spring' && <Sparrow />}
    </>
  )
}

function Cloud({ x, y, s, fill }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill} opacity="0.22">
      <ellipse cx="40" cy="18" rx="40" ry="14" />
      <ellipse cx="18" cy="16" rx="18" ry="12" />
      <ellipse cx="62" cy="14" rx="22" ry="13" />
    </g>
  )
}

/** (x, y) is the foot on the ground; the tree grows up (negative y). */
function Pine({ x, y, s, fill, snow }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="2" rx="11" ry="4" fill={fill} opacity="0.4" />
      <rect x="-2.2" y="-52" width="4.4" height="54" fill={fill} />
      <path d="M0 -100 L15 -64 H-15 Z" fill={fill} />
      <path d="M0 -78 L19 -42 H-19 Z" fill={fill} />
      <path d="M0 -50 L23 -8 H-23 Z" fill={fill} />
      {snow && <path d="M0 -100 L8 -88 H-8 Z" fill={snow} opacity="0.55" />}
      <ellipse cx="0" cy="3" rx="8" ry="3" fill={fill} />
    </g>
  )
}

function Sakura({ x, y, s, trunk, blossom }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="3" rx="16" ry="5" fill={trunk} opacity="0.38" />
      <path d="M-3.2 0 L-1.4 -108 L1.4 -108 L3.2 0 Z" fill={trunk} />
      <path
        d="M0 -92 L-22 -118 M0 -88 L20 -122 M0 -78 L-16 -100 M0 -74 L18 -96 M0 -64 L-12 -82 M0 -60 L14 -78"
        stroke={trunk}
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      {[
        [-24, -122],
        [-8, -130],
        [6, -134],
        [22, -124],
        [26, -108],
        [-18, -104],
        [10, -112],
        [-4, -116],
        [16, -92],
        [-14, -88],
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`} transform={`translate(${cx} ${cy})`} fill={blossom} opacity="0.88">
          <circle cx="0" cy="-4" r="3.1" />
          <circle cx="3.4" cy="-1" r="3.1" />
          <circle cx="2.1" cy="3.2" r="3.1" />
          <circle cx="-2.1" cy="3.2" r="3.1" />
          <circle cx="-3.4" cy="-1" r="3.1" />
          <circle cx="0" cy="0" r="1.6" fill={trunk} opacity="0.5" />
        </g>
      ))}
      <ellipse cx="0" cy="2.5" rx="10" ry="3.2" fill={trunk} />
    </g>
  )
}

function Grass({ x, y, s, fill }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={fill} fill="none" strokeLinecap="round" opacity="0.5">
      <path d="M0 0 C-1 -9 1 -14 0 -18" strokeWidth="1.5" />
      <path d="M3 0 C5 -8 4 -13 7 -16" strokeWidth="1.25" />
      <path d="M-3 0 C-6 -7 -5 -12 -8 -15" strokeWidth="1.25" />
    </g>
  )
}

function MapleLeaf({ x, y, r = 0, s = 1, fill }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path
        fill={fill}
        d="M0 18 C-1 10 -4 6 -8 3 C-16 7 -22 2 -18 -4 C-26 -8 -22 -16 -14 -13 C-16 -22 -6 -24 -2 -16 C0 -26 0 -26 0 -16 C2 -24 6 -22 14 -13 C22 -16 26 -8 18 -4 C22 2 16 7 8 3 C4 6 1 10 0 18 Z"
      />
      <path d="M0 18 V-10" stroke={fill} strokeWidth="1.15" opacity="0.55" />
    </g>
  )
}

function MapleTree({ x, y, s, trunk, leaf, leafDark }) {
  const dim = leafDark || leaf
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="3" rx="18" ry="5.5" fill={trunk} opacity="0.38" />
      <path d="M0 0 C-4 -36 4 -50 0 -80" stroke={trunk} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M0 -66 C-16 -74 -34 -86 -42 -102" stroke={trunk} strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d="M0 -62 C18 -72 36 -88 44 -104" stroke={trunk} strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d="M0 -48 C-12 -56 -26 -60 -34 -74" stroke={trunk} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M0 -50 C14 -58 26 -64 34 -76" stroke={trunk} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M0 -72 C-6 -80 -10 -92 -8 -102" stroke={trunk} strokeWidth="2" fill="none" strokeLinecap="round" />
      <MapleLeaf x="2" y="-106" s="1.2" fill={leaf} />
      <MapleLeaf x="-20" y="-98" r="-32" s="1.05" fill={dim} />
      <MapleLeaf x="22" y="-100" r="28" s="1.08" fill={leaf} />
      <MapleLeaf x="-34" y="-86" r="-18" s="0.92" fill={leaf} />
      <MapleLeaf x="34" y="-88" r="16" s="0.95" fill={dim} />
      <MapleLeaf x="-8" y="-84" r="-8" s="0.88" fill={dim} />
      <MapleLeaf x="12" y="-82" r="10" s="0.86" fill={leaf} />
      <MapleLeaf x="-28" y="-72" r="-40" s="0.78" fill={dim} />
      <MapleLeaf x="26" y="-70" r="38" s="0.8" fill={leaf} />
      <ellipse cx="0" cy="2.5" rx="11" ry="3.4" fill={trunk} />
    </g>
  )
}

function WinterScene({ far, mid, near, snow, accent }) {
  return (
    <g>
      <g fill={snow} opacity="0.35">
        <circle cx="180" cy="70" r="1.6" />
        <circle cx="260" cy="110" r="1.2" />
        <circle cx="340" cy="58" r="1.4" />
        <circle cx="1280" cy="80" r="1.5" />
        <circle cx="1360" cy="120" r="1.1" />
      </g>
      <circle cx="1120" cy="108" r="46" fill={snow} opacity="0.2" />
      <circle cx="1120" cy="108" r="30" fill={snow} opacity="0.55" />
      <circle cx="1108" cy="98" r="8" fill={accent} opacity="0.12" />
      <path
        d="M0 400 C120 340 200 280 300 230 C380 185 450 220 520 270 C600 175 690 130 780 175 C860 95 950 70 1040 130 C1130 55 1220 95 1320 165 C1380 125 1420 155 1440 190 L1440 900 L0 900 Z"
        fill={far}
      />
      <path d="M620 185 L655 248 L700 210 L742 262 L790 192" fill="none" stroke={snow} strokeWidth="6" opacity="0.5" strokeLinejoin="round" />
      <path d="M1000 128 L1040 190 L1088 150 L1130 210" fill="none" stroke={snow} strokeWidth="5.5" opacity="0.45" strokeLinejoin="round" />
      <path
        d="M0 510 C200 450 340 420 480 460 C620 370 760 400 900 470 C1040 380 1200 420 1440 490 L1440 900 L0 900 Z"
        fill={mid}
      />
      <path
        d="M0 640 C180 600 320 620 480 650 C680 580 880 630 1100 600 C1260 580 1380 620 1440 610 L1440 900 L0 900 Z"
        fill={near}
      />
      <path
        d="M0 640 C180 600 320 620 480 650 C680 580 880 630 1100 600 C1260 580 1380 620 1440 610"
        fill="none"
        stroke={mid}
        strokeWidth="2.2"
        opacity="0.35"
      />
      <Pine x="92" y="628" s="2.2" fill={near} snow={snow} />
      <Pine x="158" y="652" s="1.65" fill={near} snow={snow} />
      <Pine x="1188" y="618" s="2.5" fill={near} snow={snow} />
      <Pine x="1272" y="638" s="1.95" fill={near} snow={snow} />
      <Pine x="1352" y="655" s="1.55" fill={near} snow={snow} />
      <Grass x="70" y="632" s="1.4" fill={snow} />
      <Grass x="180" y="656" s="1.1" fill={snow} />
      <Grass x="1220" y="624" s="1.3" fill={snow} />
    </g>
  )
}

function SpringScene({ far, mid, near, snow, accent, season }) {
  return (
    <g>
      <Cloud x="80" y="70" s="1.4" fill={snow} />
      <Cloud x="320" y="110" s="0.9" fill={snow} />
      <Cloud x="1180" y="80" s="1.1" fill={snow} />
      <path
        d="M0 390 C160 340 280 355 400 310 C500 275 580 310 680 350 L0 390 Z"
        fill={far}
        opacity="0.5"
      />
      <path
        d="M40 840 C340 620 540 170 860 28 C900 8 948 8 986 38 C1240 250 1360 540 1440 780 L1440 900 L0 900 Z"
        fill={mid}
      />
      <path
        d="M640 210 C700 150 760 90 820 48 C780 100 720 170 640 210 Z"
        fill={near}
        opacity="0.35"
      />
      <path
        d="M700 200 C790 90 860 28 932 24 C980 70 1080 150 1180 250 L1100 270 C1020 180 940 90 868 70 C800 120 740 170 700 200 Z"
        fill={`url(#fuji-snow-${season})`}
      />
      <path
        d="M760 70 L790 118 L820 78 L850 130 L890 72 L920 110 L948 48"
        fill="none"
        stroke={mid}
        strokeWidth="3.2"
        opacity="0.45"
        strokeLinejoin="round"
      />
      <path d="M860 40 L780 280" stroke={near} strokeWidth="2" opacity="0.25" />
      <path d="M930 42 L1040 260" stroke={near} strokeWidth="2" opacity="0.2" />
      <path
        d="M0 800 C280 745 540 780 820 758 C1100 736 1300 790 1440 770 L1440 900 L0 900 Z"
        fill={near}
      />
      <path
        d="M0 820 L0 500 C48 512 78 538 96 548 C138 565 160 650 178 698 C198 748 70 800 0 820 Z"
        fill={near}
      />
      <path
        d="M0 500 C48 512 78 538 96 548 C138 565 160 650 178 698"
        fill="none"
        stroke={mid}
        strokeWidth="2.4"
        opacity="0.4"
      />
      <path
        d="M1440 820 L1440 500 C1410 515 1372 548 1344 562 C1362 640 1388 688 1408 720 C1424 760 1440 792 1440 820 Z"
        fill={near}
      />
      <path
        d="M1440 500 C1410 515 1372 548 1344 562 C1362 640 1388 688 1408 720"
        fill="none"
        stroke={mid}
        strokeWidth="2.4"
        opacity="0.4"
      />
      <Sakura x="96" y="548" s="3.15" trunk={near} blossom={snow} />
      <Sakura x="178" y="698" s="2.25" trunk={near} blossom={accent} />
      <Sakura x="1344" y="562" s="2.75" trunk={near} blossom={snow} />
      <Sakura x="1408" y="720" s="1.95" trunk={near} blossom={accent} />
      <Grass x="58" y="552" s="1.6" fill={accent} />
      <Grass x="148" y="702" s="1.25" fill={snow} />
      <Grass x="1298" y="568" s="1.45" fill={accent} />
    </g>
  )
}

function SummerScene({ far, mid, near, snow, accent }) {
  return (
    <g>
      <circle cx="1188" cy="132" r="78" fill={accent} opacity="0.14" />
      <circle cx="1188" cy="132" r="42" fill={snow} opacity="0.55" />
      <g stroke={snow} strokeWidth="2" opacity="0.28" strokeLinecap="round">
        <path d="M1188 52 V28" />
        <path d="M1188 212 V236" />
        <path d="M1108 132 H1084" />
        <path d="M1268 132 H1292" />
        <path d="M1132 76 L1114 58" />
        <path d="M1244 188 L1262 206" />
        <path d="M1244 76 L1262 58" />
        <path d="M1132 188 L1114 206" />
      </g>
      <ellipse cx="720" cy="650" rx="1000" ry="78" fill={far} opacity="0.32" />
      <path
        d="M500 575 C590 470 660 420 750 408 C850 420 940 490 1030 590 C920 565 780 558 500 575 Z"
        fill={mid}
      />
      <Pine x="702" y="528" s="1.35" fill={near} />
      <Pine x="752" y="538" s="1.05" fill={near} />
      <Pine x="808" y="548" s="1.22" fill={near} />
      <path
        d="M0 700 C240 665 500 688 740 670 C1020 648 1260 690 1440 668 L1440 900 L0 900 Z"
        fill={near}
      />
      <g fill="none" stroke={snow} strokeWidth="1.4" opacity="0.22">
        <path d="M80 678 Q240 662 400 680 Q560 662 720 678 Q900 660 1080 676 Q1260 662 1420 674" />
        <path d="M120 698 Q300 684 480 700 Q680 682 880 698 Q1100 684 1320 696" />
      </g>
    </g>
  )
}

function AutumnScene({ far, mid, near, snow, accent }) {
  return (
    <g>
      <circle cx="200" cy="108" r="52" fill={snow} opacity="0.16" />
      <circle cx="200" cy="108" r="28" fill={snow} opacity="0.42" />
      <circle cx="188" cy="98" r="7" fill={accent} opacity="0.2" />
      <path
        d="M0 300 C140 230 260 250 400 180 C540 110 680 160 820 95 C980 20 1140 80 1440 40 L1440 900 L0 900 Z"
        fill={far}
      />
      <path
        d="M0 430 C180 350 360 390 540 310 C760 220 980 300 1440 250 L1440 900 L0 900 Z"
        fill={mid}
      />
      <path
        d="M0 640 C260 575 540 620 820 585 C1100 550 1300 610 1440 585 L1440 900 L0 900 Z"
        fill={near}
      />
      <path
        d="M0 640 C260 575 540 620 820 585 C1100 550 1300 610 1440 585"
        fill="none"
        stroke={mid}
        strokeWidth="2.2"
        opacity="0.38"
      />
      <MapleTree x="108" y="618" s="1.7" trunk={near} leaf={accent} leafDark={far} />
      <MapleTree x="238" y="655" s="1.22" trunk={near} leaf={far} leafDark={mid} />
      <MapleTree x="1160" y="598" s="1.85" trunk={near} leaf={accent} leafDark={far} />
      <MapleTree x="1310" y="638" s="1.32" trunk={near} leaf={far} leafDark={mid} />
      <Grass x="72" y="622" s="1.5" fill={accent} />
      <Grass x="268" y="658" s="1.2" fill={far} />
      <Grass x="1218" y="604" s="1.4" fill={accent} />
      <MapleLeaf x="980" y="168" r="-18" s="1.15" fill={accent} />
      <MapleLeaf x="1048" y="198" r="22" s="0.9" fill={far} />
      <MapleLeaf x="360" y="210" r="-30" s="0.8" fill={accent} />
    </g>
  )
}
