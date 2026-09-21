import './Sparrow.css'

/** House sparrow — fanned primaries and cream belly, the detailed silhouette. */
export default function Sparrow() {
  return (
    <svg className="season-sparrow" viewBox="0 0 320 240" aria-hidden="true">
      <g className="sparrow-rig">
        <g className="sparrow-far-idle">
          <g className="sparrow-far-present">
            <g className="sparrow-far-flap">
              <path
                d="M150 118 C128 96 102 84 78 90 C70 96 74 108 86 112 C108 122 132 126 150 124 Z"
                fill="#4a3428"
              />
              <path d="M86 100 L58 82" stroke="#2a1e16" strokeWidth="3.4" strokeLinecap="round" />
              <path d="M90 108 L52 100" stroke="#2a1e16" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M94 114 L60 126" stroke="#2a1e16" strokeWidth="3" strokeLinecap="round" />
            </g>
          </g>
        </g>

        <g className="sparrow-tail-idle">
          <g className="sparrow-tail-present">
            <g className="sparrow-tail-wag">
              <g className="sparrow-tail-vane sparrow-tail-vane--1">
                <path d="M104 128 L42 108" stroke="#2a1e16" strokeWidth="4.6" strokeLinecap="round" />
              </g>
              <g className="sparrow-tail-vane sparrow-tail-vane--2">
                <path d="M104 136 L36 132" stroke="#1e1610" strokeWidth="5" strokeLinecap="round" />
              </g>
              <g className="sparrow-tail-vane sparrow-tail-vane--3">
                <path d="M106 144 L48 168" stroke="#2e221a" strokeWidth="4.8" strokeLinecap="round" />
              </g>
              <g className="sparrow-tail-vane sparrow-tail-vane--4">
                <path d="M104 140 L40 150" stroke="#241c16" strokeWidth="4.2" strokeLinecap="round" />
              </g>
              <g className="sparrow-tail-vane sparrow-tail-vane--5">
                <path d="M106 132 L50 118" stroke="#3a2c22" strokeWidth="3.6" strokeLinecap="round" />
              </g>
            </g>
          </g>
        </g>

        <g className="sparrow-torso">
          <ellipse cx="154" cy="128" rx="50" ry="34" fill="#6b4a32" />
          <ellipse cx="164" cy="140" rx="42" ry="26" fill="#f3e2bc" />
          <path d="M118 118 C128 104 150 100 168 108 C158 118 136 124 118 118 Z" fill="#7a5538" />
          <path d="M186 116 C198 126 194 144 176 150 C166 138 174 120 186 116 Z" fill="#1e1814" />
        </g>

        <g className="sparrow-legs">
          <g className="sparrow-leg sparrow-leg--l">
            <path d="M148 154 L140 186" stroke="#d4a87a" strokeWidth="3.1" strokeLinecap="round" />
            <path d="M132 186 L150 184" stroke="#d4a87a" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M140 186 L136 194" stroke="#c49668" strokeWidth="1.6" strokeLinecap="round" />
          </g>
          <g className="sparrow-leg sparrow-leg--r">
            <path d="M158 154 L168 184" stroke="#d4a87a" strokeWidth="3.1" strokeLinecap="round" />
            <path d="M160 184 L180 186" stroke="#d4a87a" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M168 184 L174 194" stroke="#c49668" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </g>

        <g className="sparrow-near-idle">
          <g className="sparrow-near-present">
            <g className="sparrow-near-flap">
              <path
                d="M166 112 C148 96 136 100 142 118 C150 124 162 122 166 112 Z"
                fill="#5c4030"
              />
              <path d="M146 108 L166 114" stroke="#f0ddb8" strokeWidth="2.6" strokeLinecap="round" />
              <g className="sparrow-primary sparrow-primary--1">
                <path d="M150 112 C126 90 100 74 74 68" stroke="#2c2218" strokeWidth="5.6" strokeLinecap="round" fill="none" />
              </g>
              <g className="sparrow-primary sparrow-primary--2">
                <path d="M152 118 C124 102 94 90 66 86" stroke="#241c16" strokeWidth="5.4" strokeLinecap="round" fill="none" />
              </g>
              <g className="sparrow-primary sparrow-primary--3">
                <path d="M154 124 C126 116 96 112 68 114" stroke="#2a2018" strokeWidth="5.2" strokeLinecap="round" fill="none" />
              </g>
              <g className="sparrow-primary sparrow-primary--4">
                <path d="M154 128 C128 134 100 144 74 156" stroke="#1e1814" strokeWidth="4.8" strokeLinecap="round" fill="none" />
              </g>
              <g className="sparrow-primary sparrow-primary--5">
                <path d="M152 122 C134 108 114 94 90 84" stroke="#3a2c22" strokeWidth="3.6" strokeLinecap="round" fill="none" />
              </g>
            </g>
          </g>
        </g>

        <g className="sparrow-head-idle">
          <g className="sparrow-head-turn">
            <ellipse cx="214" cy="100" rx="28" ry="24" fill="#e2cda8" />
            <path d="M190 96 C198 76 228 74 240 94 C228 88 206 86 190 96 Z" fill="#5a4634" />
            <ellipse cx="222" cy="106" rx="13" ry="11" fill="#fbf3e2" />
            <path d="M200 112 C210 122 224 124 232 116 C220 118 208 114 200 112 Z" fill="#1a1410" />
            <g className="sparrow-eye">
              <circle cx="228" cy="96" r="5" fill="#1a120c" />
              <circle cx="229.4" cy="94.6" r="1.5" fill="#f7f1e4" />
            </g>
            <g className="sparrow-beak">
              <path className="sparrow-beak-upper" d="M240 100 L276 106 L240 109 Z" fill="#3a3530" />
              <path className="sparrow-beak-lower" d="M240 108 L264 114 L240 111 Z" fill="#2e2a26" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
