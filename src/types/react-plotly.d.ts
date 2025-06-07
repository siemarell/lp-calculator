declare module 'react-plotly.js' {
  import { Component } from 'react';
  import { Data, Layout, Config } from 'plotly.js';

  interface PlotParams {
    data: Data[];
    layout?: Partial<Layout>;
    config?: Partial<Config>;
    style?: React.CSSProperties;
    className?: string;
    onInitialized?: (figure: any) => void;
    onUpdate?: (figure: any) => void;
    onPurge?: (figure: any) => void;
    onError?: (err: any) => void;
    onRelayout?: (eventData: any) => void;
    onRedraw?: () => void;
    onSelected?: (eventData: any) => void;
    onSelecting?: (eventData: any) => void;
    onUnselect?: () => void;
    onClick?: (eventData: any) => void;
    onHover?: (eventData: any) => void;
    onUnhover?: (eventData: any) => void;
    onDoubleClick?: () => void;
    onBeforeHover?: (eventData: any) => void;
    onAfterPlot?: () => void;
    onAfterExport?: () => void;
    onAutoplay?: () => void;
    onButtonClicked?: (eventData: any) => void;
    onSliderChange?: (eventData: any) => void;
    onSliderEnd?: (eventData: any) => void;
    onTransitioning?: (eventData: any) => void;
    onTransitionInterrupted?: (eventData: any) => void;
    onSunburstClick?: (eventData: any) => void;
    onSunburstHover?: (eventData: any) => void;
    onSunburstUnhover?: (eventData: any) => void;
    onSunburstClick?: (eventData: any) => void;
    onSunburstHover?: (eventData: any) => void;
    onSunburstUnhover?: (eventData: any) => void;
    onSunburstClick?: (eventData: any) => void;
    onSunburstHover?: (eventData: any) => void;
    onSunburstUnhover?: (eventData: any) => void;
  }

  export default class Plot extends Component<PlotParams> {}
} 