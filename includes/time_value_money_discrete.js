/**
 * Calculates the 'present value' of a loan given it's cash flows
 * @param {number} interest_rate - the interest rate used to discount cash flows
 * @param {Array<number>} times - the times of the cash flows
 * @param {Array<number>} cash_flows - the amount of the cash flows
 * @returns {number} - the 'present value'
 */
function loan_pv(interest_rate, times, cash_flows) {
    if (times.length != cash_flows.length) {
        return NaN;
    }

    var pv = 0;
    for (var i = 0; i < times.length; i++) {
        pv += cash_flows[i] / ((1 + interest_rate) ** times[i]);
    }

    return pv;
}

// Calculates the 'yield to maturity' of a loan given it's cash flows
// i.e. the internal rate of return
function loan_ytm(interest_rate, times, cash_flows) {
    if (times.length != cash_flows.length) {
        return NaN;
    }

    const ACCURACY = 0.00005;
    const MAX_ITERATIONS = 200;

    var bottom = 0, top = 1;

    var pv = loan_pv(interest_rate, times, cash_flows);

    while (loan_pv(top, times, cash_flows) > pv) { top = top * 2; }
    var ytm = 0.5 * (top + bottom);
    for (i = 0; i < MAX_ITERATIONS; i++) {
        var diff = loan_pv(ytm, times, cash_flows) - pv;
        if (Math.abs(diff) < ACCURACY) { return ytm; }
        if (diff > 0) { bottom = ytm; }
        else { top = ytm; }
        ytm = 0.5 * (top + bottom);
    }

    return ytm;
}

// Calculates the 'yield to maturity' of a loan given it's cash flows & price
function loan_ytm_from_price(pv, times, cash_flows) {
    if (times.length != cash_flows.length) {
        return NaN;
    }

    const ACCURACY = 0.00005;
    const MAX_ITERATIONS = 200;

    var bottom = 0, top = 1;

    while (loan_pv(top, times, cash_flows) > pv) { top = top * 2; }
    var ytm = 0.5 * (top + bottom);
    for (i = 0; i < MAX_ITERATIONS; i++) {
        var diff = loan_pv(ytm, times, cash_flows) - pv;
        if (Math.abs(diff) < ACCURACY) { return ytm; }
        if (diff > 0) { bottom = ytm; }
        else { top = ytm; }
        ytm = 0.5 * (top + bottom);
    }

    return ytm;
}

// Calculates the 'duration' of a loan given it's cash flows
// i.e. the weighted average maturity of a loan
function loan_duration(interest_rate, times, cash_flows) {
    if (times.length != cash_flows.length) {
        return NaN;
    }

    var pv = loan_pv(interest_rate, times, cash_flows);

    var duration_sum = 0;
    for (var i = 0; i < times.length; i++) {
        duration_sum += times[i] * cash_flows[i] / ((1 + interest_rate) ** times[i]);
    }

    return duration_sum / pv;
}

// Calculates the 'macaulay duration' of a loan given it's cash flows
// i.e. the duration using it's YTM
function loan_mac_duration(interest_rate, times, cash_flows) {
    if (times.length != cash_flows.length) {
        return NaN;
    }

    var ytm = loan_ytm(interest_rate, times, cash_flows);
    var duration = loan_duration(ytm, times, cash_flows);

    return duration;
}

// Calculates the 'modified duration' of a loan given it's cash flows
// i.e. the first order sensitivity of a loan PV with respect to interest rate
function loan_mod_duration(interest_rate, times, cash_flows) {
    if (times.length != cash_flows.length) {
        return NaN;
    }

    var ytm = loan_ytm(interest_rate, times, cash_flows);
    var duration = loan_duration(ytm, times, cash_flows);

    return duration / (1 + ytm);
}

// Calculates the 'convexity' of a loan given it's cash flows
// i.e. the second order sensitivity of a loan PV with respect to interest rate
function loan_convexity(interest_rate, times, cash_flows) {
    if (times.length != cash_flows.length) {
        return NaN;
    }

    var pv = loan_pv(interest_rate, times, cash_flows);

    var convex_sum = 0;
    for (var i = 0; i < times.length; i++) {
        convex_sum += cash_flows[i] * times[i] * (times[i] + 1) / ((1 + interest_rate) ** times[i]);
    }

    return convex_sum / ((1 + interest_rate) ** 2) / pv;
}

// Calculates the effective change in PV of a loan given it's cash flows & a change in interest rate
function loan_pv_delta_on_interest_rate_delta(interest_rate, times, cash_flows, interest_rate_delta) {
    if (times.length != cash_flows.length) {
        return NaN;
    }

    var pv = loan_pv(interest_rate, times, cash_flows);
    var duration = loan_mod_duration(interest_rate, times, cash_flows);
    var delta_percent = -duration * interest_rate_delta;

    return delta_percent * pv;
}

// Calculates more precisely the effective change in PV of a loan given it's cash flows & a change in interest rate
function loan_pv_delta_on_interest_rate_delta_with_convex(interest_rate, times, cash_flows, interest_rate_delta) {
    if (times.length != cash_flows.length) {
        return NaN;
    }

    var pv = loan_pv(interest_rate, times, cash_flows);
    var duration = loan_mod_duration(interest_rate, times, cash_flows);
    var convexity = loan_convexity(interest_rate, times, cash_flows);
    var delta_percent = -duration * interest_rate_delta;
    delta_percent += (convexity / 2) * (interest_rate_delta ** 2);

    return delta_percent * pv;
}



module.exports = {
    loan_pv,
    loan_ytm,
    loan_ytm_from_price,
    loan_duration,
    loan_mac_duration,
    loan_mod_duration,
    loan_convexity,
    loan_pv_delta_on_interest_rate_delta,
    loan_pv_delta_on_interest_rate_delta_with_convex
}
