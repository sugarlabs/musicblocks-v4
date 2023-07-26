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

type burstChartType = {
    name: string;
    value: number;
    subData?: burstChartType[];
};

export type BurstPieChartProps = {
    config: {
        dataColors: string[];
        subDataColors: string[];
        backgroundColor: string;
        data: burstChartType[];
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

export type PieChartProps = {
    config: {
        innerCircleVisible: boolean;
        levels: number;
        colors: string[];
        backgroundColor: string;
    };
};
