import React from 'react';
import { SimpleBrickView } from '../../brick/view/components/simple';
import { ExpressionBrickView } from '../../brick/view/components/expression';
import { CompoundBrickView } from '../../brick/view/components/compound';
import type { BrickConfig } from '../utils/types';

export type BrickType = 'simple' | 'expression' | 'compound';

const DEFAULT_STROKE_WIDTH = 1;
const DEFAULT_SCALE = 1;
const DEFAULT_COLOR_FG = '#000';
const DEFAULT_SHADOW = false;
const DEFAULT_VISIBLE = true;
const DEFAULT_STATE = 'default';

function makeArgs(config: BrickConfig) {
  return config.argCount > 0 ? Array(config.argCount).fill({ w: 20, h: 20 }) : [];
}

function wrap<P extends object>(View: React.ComponentType<P>): React.FC<BrickConfig> {
  return function WrappedBrickView(cfg: BrickConfig) {
    const [content, setContent] = React.useState<React.ReactNode>(null);

    React.useEffect(() => {
      let isMounted = true;

      const renderView = async () => {
        const common = {
          label: cfg.label,
          labelType: 'text' as const,
          colorBg: cfg.color,
          colorFg: DEFAULT_COLOR_FG,
          strokeColor: DEFAULT_COLOR_FG,
          strokeWidth: DEFAULT_STROKE_WIDTH,
          scale: DEFAULT_SCALE,
          shadow: DEFAULT_SHADOW,
          tooltip: cfg.id,
          bboxArgs: makeArgs(cfg),
          visualState: DEFAULT_STATE,
          isActionMenuOpen: false,
          isVisible: DEFAULT_VISIBLE,
        };

        let result: React.ReactNode;

        try {
          switch (cfg.type) {
            case 'simple':
              result = (
                <SimpleBrickView
                  {...(common as React.ComponentProps<typeof SimpleBrickView>)}
                  topNotch={cfg.notches.top}
                  bottomNotch={cfg.notches.bottom}
                />
              );
              break;
            case 'expression':
              result = (
                <ExpressionBrickView
                  {...(common as React.ComponentProps<typeof ExpressionBrickView>)}
                />
              );
              break;
            case 'compound':
              result = (
                <CompoundBrickView
                  {...(common as React.ComponentProps<typeof CompoundBrickView>)}
                  bboxNest={[]}
                  topNotch={cfg.notches.top}
                  bottomNotch={cfg.notches.bottom}
                />
              );
              break;
            default:
              result = null;
          }

          const finalResult = result;

          if (isMounted) {
            setContent(finalResult);
          }
        } catch (error) {
          console.error('Error rendering brick:', error);
          if (isMounted) {
            setContent(<div>Error rendering brick</div>);
          }
        }
      };

      renderView();

      return () => {
        isMounted = false;
      };
    }, [cfg]);

    return (
      content || (
        <div
          style={{
            width: '100%',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span>Loading...</span>
        </div>
      )
    );
  };
}

export const brickViews: Record<BrickType, React.FC<BrickConfig>> = {
  simple: wrap(SimpleBrickView),
  expression: wrap(ExpressionBrickView),
  compound: wrap(CompoundBrickView),
};
