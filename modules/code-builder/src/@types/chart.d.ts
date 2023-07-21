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

export type BurstPieChartProps = {
    config: {
        innerCircleVisible: boolean;
        levels: number;
        colors: string[];
        backgroundColor: string;
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
