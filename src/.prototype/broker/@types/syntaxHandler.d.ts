import { IAST } from '../../syntax-core/@types/AST';
import { ISyntaxElement } from '../../syntax-core/@types/structureElements';
import { TSyntaxElementName } from '../../syntax-core/syntaxElementFactory';

type TQuery =
    | {
          action: 'create';
          props: {
              elementName: TSyntaxElementName;
              arg?: number | string;
          };
      }
    | {
          action: 'remove';
          props: {
              elementID: string;
          };
      }
    | {
          action: 'attach-ins';
          props: {
              elementID_1: string;
              elementID_2: string;
          };
      }
    | {
          action: 'attach-arg';
          props: {
              elementID_1: string;
              elementID_2: string;
              argLabel: string;
          };
      };

export interface ISyntaxHandler {
    /** Processes all messages related to syntax and returns acknowledgement or throws error. */
    processQuery: (query: TQuery) => string;
    /** Returns the corresponding syntax element for an elementID. */
    getElement: (
        elementID: string
    ) => {
        elementName: string;
        element: ISyntaxElement;
        type: 'statement' | 'block' | 'arg-data' | 'arg-exp';
    };
    /** Returns the AST object. */
    AST: IAST;
}
