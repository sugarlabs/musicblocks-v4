export type ChartType = 'burst' | 'classed' | 'pie';

export interface ChartConfig {
    type: ChartType;
    innerCircleVisible: boolean;
    levels: number;
    colors: string[];
    backgroundColor: string;
    // data:
}

type config = Omit<ChartConfig, 'type'>;

export interface ChartProps {
    chartConfig: ChartConfig;
}

type burstChartDataType = {
    name: string;
    value: number;
    subData?: burstChartDataType[];
};

export type BurstPieChartProps = {
    config: {
        dataColors: string[];
        subDataColors: string[];
        backgroundColor: string;
        data: burstChartDataType[];
        handler: (name: string) => void;
    };
};

export type ClassedPieChartProps = {
    config: {
        innerCircleVisible: boolean;
        levels: number;
        colors: string[];
        backgroundColor: string;
    };
};

type pieChartDataType = {
    name: string;
    value: number;
    colors: string[];
};

export type PieChartProps = {
    config: {
        innerCircleVisible: boolean;
        backgroundColor: string;
        data: pieChartDataType[][];
        handler: (name: string) => void;
        handleClose?: () => void;
    };
};
