type TQuery =
    | {
          action: 'create';
          props: {
              elementName: string;
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
}
