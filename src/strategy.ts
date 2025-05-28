import * as Plotly from 'plotly.js';
import { OptionPosition } from './options';
import { UniswapV3Position } from './uniswap_v3';

export class Strategy {
  name: string;
  positions: Array<UniswapV3Position | OptionPosition>;

  constructor(name: string, positions: Array<UniswapV3Position | OptionPosition>) {
    this.name = name;
    this.positions = positions;
  }

  plot(prices: number[], days: number | null = null): void {
    if (days !== null && days <= 0) {
      throw new Error("days must be positive");
    }

    // Create a div for the plot if it doesn't exist
    let plotDiv = document.getElementById('plot');
    if (!plotDiv) {
      plotDiv = document.createElement('div');
      plotDiv.id = 'plot';
      document.body.appendChild(plotDiv);
    }

    // Initialize total payoff array with zeros
    const total_payoff = new Array(prices.length).fill(0);
    const intersection_prices: number[] = [];
    let static_payoff = 0;

    // Data for the plot
    const data: Plotly.Data[] = [];

    for (const position of this.positions) {
      if (position instanceof UniswapV3Position) {
        // Add range as a rectangle
        data.push({
          type: 'rect',
          x0: position.p_l,
          x1: position.p_u,
          y0: -Infinity,
          y1: Infinity,
          fillcolor: 'green',
          opacity: 0.1,
          line: { width: 0 },
          name: `Range ${position.p_l} - ${position.p_u}`
        });

        // Add current price line
        if (position.token0_price_in_token1) {
          data.push({
            type: 'scatter',
            x: [position.token0_price_in_token1, position.token0_price_in_token1],
            y: [-Infinity, Infinity],
            mode: 'lines',
            line: { color: 'red', dash: 'dot' },
            name: 'Current Price'
          });
        }

        // Calculate impermanent loss
        const il = position.impermanent_loss(prices) as number[];

        // Add annotations for lower and upper bounds
        let lower_drawn = false;
        let upper_drawn = false;
        const annotations: Plotly.Annotations[] = [];

        for (let i = 0; i < prices.length; i++) {
          if (!lower_drawn && prices[i] > position.p_l) {
            lower_drawn = true;
            annotations.push({
              x: prices[i],
              y: il[i],
              text: `$${il[i].toFixed(2)}`,
              showarrow: false,
              yanchor: 'bottom'
            });
          }
          if (!upper_drawn && prices[i] > position.p_u) {
            upper_drawn = true;
            annotations.push({
              x: prices[i],
              y: il[i],
              text: `$${il[i].toFixed(2)}`,
              showarrow: false,
              yanchor: 'bottom'
            });
          }
        }

        // Add impermanent loss line
        data.push({
          type: 'scatter',
          x: prices,
          y: il,
          mode: 'lines',
          line: { dash: 'dash' },
          name: position.label
        });

        // Calculate and add collected fees
        const collected_fees = position.calculate_fees(days);
        if (collected_fees) {
          data.push({
            type: 'scatter',
            x: [prices[0], prices[prices.length - 1]],
            y: [collected_fees, collected_fees],
            mode: 'lines',
            line: { color: 'blue', dash: 'dot' },
            name: `Collected Fees: $${collected_fees.toFixed(2)}`
          });

          annotations.push({
            x: prices[0],
            y: collected_fees,
            text: collected_fees.toFixed(2),
            showarrow: false,
            yanchor: 'bottom'
          });

          static_payoff += collected_fees;
          // Add collected fees to total payoff
          for (let i = 0; i < total_payoff.length; i++) {
            total_payoff[i] += collected_fees;
            total_payoff[i] += il[i];
          }
        }

        intersection_prices.push(position.p_l);
        intersection_prices.push(position.p_u);

        // Add annotations to the plot
        for (const annotation of annotations) {
          Plotly.addAnnotation(plotDiv, annotation);
        }
      } else {
        // Handle OptionPosition
        const position_values = position.payoff(prices) as number[];
        
        // Add position values to total payoff
        for (let i = 0; i < total_payoff.length; i++) {
          total_payoff[i] += position_values[i];
        }
        
        static_payoff -= position.total_premium;
        
        // Add option position line
        data.push({
          type: 'scatter',
          x: prices,
          y: position_values,
          mode: 'lines',
          line: { dash: 'dash' },
          name: position.label
        });
      }
    }

    // Add static payoff line
    data.push({
      type: 'scatter',
      x: [prices[0], prices[prices.length - 1]],
      y: [static_payoff, static_payoff],
      mode: 'lines',
      line: { color: 'green', dash: 'dot' },
      name: `Fees - Premium: ${static_payoff.toFixed(2)}`
    });

    Plotly.addAnnotation(plotDiv, {
      x: prices[0],
      y: static_payoff,
      text: static_payoff.toFixed(2),
      showarrow: false,
      yanchor: 'bottom'
    });

    // Add annotations for intersection points
    let n = 1;
    for (const ip of intersection_prices) {
      for (let i = 0; i < prices.length; i++) {
        if (prices[i] > ip) {
          const payoff_at_price = total_payoff[i];
          Plotly.addAnnotation(plotDiv, {
            x: prices[i],
            y: payoff_at_price,
            text: `$${payoff_at_price.toFixed(2)}`,
            showarrow: false,
            yanchor: 'bottom'
          });
          n++;
          break;
        }
      }
    }

    // Add total strategy line
    data.push({
      type: 'scatter',
      x: prices,
      y: total_payoff,
      mode: 'lines',
      line: { color: 'black', width: 2 },
      name: 'Total Strategy'
    });

    // Create the plot
    const layout: Partial<Plotly.Layout> = {
      title: this.name,
      xaxis: { title: 'Price' },
      yaxis: { title: 'Profit / Loss' },
      showlegend: true,
      grid: { rows: 1, columns: 1 }
    };

    Plotly.newPlot(plotDiv, data, layout);
  }
}
