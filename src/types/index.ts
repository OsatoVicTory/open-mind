export interface LoadingType {
    loading: boolean;
    error: boolean;
    loaded: boolean;
    state: number;
};

export interface OrderType {
    price: number, 
    qty: number, 
    price_decimal: number,
    account_id: string,
    circulation_order: boolean
}

/*
novel, turtle, symbol, couch, front, soccer, price, draw, insect, stairs, coach, razor
*/