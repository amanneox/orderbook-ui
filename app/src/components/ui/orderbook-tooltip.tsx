import React from 'react';

interface OrderbookTooltipProps {
    sumAmount: number;
    sumValue: number;
    avgValue: number;
}

const OrderbookTooltip: React.FC<OrderbookTooltipProps> = ({ sumAmount, sumValue, avgValue }) => {
    return (
        <div className="orderbook-tooltip">
            <div className="tooltip-item">
                <span>Sum Amount:</span> {sumAmount}
            </div>
            <div className="tooltip-item">
                <span>Sum Value:</span> {sumValue}
            </div>
            <div className="tooltip-item">
                <span>Avg Value:</span> {avgValue}
            </div>
        </div>
    );
};




export default OrderbookTooltip;