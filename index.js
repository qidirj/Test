/*
Buyables:
0 -> Neutron x1
1 -> Neutron x10
2 -> Proton x1
3 -> Proton x10
*/

/* ExpantaNum & Library*/
function EN(x) {
    return ExpantaNum.ExpantaNum(x);
}

function ENify(x) {
    if (typeof x == "number") {
        return EN(x);
    } else if (x == "null") {
        return EN(0);
    } else {
        let newEN = new EN(114514);
        newEN.array = x.array;
        newEN.sign = x.sign;
        newEN.layer = x.layer;
        return newEN;
    }
}

function beautify(number) {
    if (typeof number == "number") {
        if (Math.abs(number) < 0.00001) {
            return "0.00";
        }
        if (number == Infinity) {
            return "Infinity";
        } else {
            let exponent = Math.floor(Math.log10(number));
            let mantissa = number / Math.pow(10, exponent);
            if (exponent < 6) return toString(Math.round(number));
            if (mantissa.toFixed(4) == "10.0000") return "9.9999e" + exponent;
            return mantissa.toFixed(4) + "e" + exponent;
        }
    } else {
        return beautifyEN(number);
    }
}

function beautifyEN(n) {
    let x = EN(n);
    if (x.gte("eeeee10")) {
        return `10{${x.array[x.array.length-1][0]+1}}${x.array[x.array.length-1][1]+2}`
        return x.toString()
    }
    if (x.lte(1e6)) {
        return x.toNumber().toFixed(2);
    } else if (x.lte("ee6")) {
        let exponent = x.log10().floor();
        let mantissa = x
            .divide(EN(10).pow(exponent))
            .toNumber()
            .toFixed(4);
        if (mantissa == "10.0000") exponent = exponent.add(1);
        if (mantissa == "10.0000") mantissa = "1.0000";
        return mantissa + "e" + exponent.floor();
    } else {
        return "e" + beautifyEN(x.log10())
    }
}

function calcProgressAdd(nps, delta) {
    if (nps instanceof ExpantaNum) {
        return nps.divide(1000.0).mul(delta);
    }
    return nps / 1000.0 * delta;
}

function calcProgressMul(nps, delta) {
    if (nps instanceof ExpantaNum) {
        return nps.pow(delta / 1000);
    }
    return nps ** (delta / 1000);
}

function calcProgressPow(nps, delta) {
    if (nps instanceof ExpantaNum) {
        return nps.log(1000 / delta);
    }
    return log(nps, 1000 / delta);
}


//Data
game = {
    quarks: ENify(0),
    electrons: ENify(0),
    protons: ENify(0),
    neutrons: ENify(0),
    tickSpeed: 30,
    lastTick: Date.now(),
};

buyableCosts = [
    (pt = game.protons) => pt.add(ENify(3)),
    () => (buyableCosts[0]().add(buyableCosts[0](game.protons.add(9))).mul(5)),
    (nt = game.neutrons) => nt.add(ENify(3)),
    () => (buyableCosts[2]().add(buyableCosts[2](game.neutrons.add(9))).mul(5)),
];

quarkGain = () => game.protons.mul(0.1).add(0.3);
quarkGainS = () => game.neutrons.mul(0.1);

//Display
function displayButton(money, cost, id, unlocked, type) {
    let cost2 = ENify(cost);
    document.getElementById(id).innerHTML = beautify(cost2);
    if (unlocked) {
        if (ENify(money).gte(cost2)) {
            document.getElementById(id).parentElement.className = "standard " + type;
        } else {
            document.getElementById(id).parentElement.className = "expensive " + type;
        }
    } else {
        document.getElementById(id).parentElement.className = "locked " + type;
    }
}

function refresh() {
    document.getElementById("head-quarks").innerHTML = beautify(game.quarks);
    document.getElementById("head-elecs").innerHTML = beautify(game.electrons);
    document.getElementById("proton-num").innerHTML = beautify(game.protons);
    document.getElementById("neutron-num").innerHTML = beautify(game.neutrons);
    document.getElementById("proton-effect").innerHTML = beautify(game.protons.mul(0.1));
    document.getElementById("neutron-effect").innerHTML = beautify(game.neutrons.mul(0.1));
    displayButton(ENify(Infinity), quarkGain(), "quark-gain", true, "small-buyable");
    displayButton(game.quarks, buyableCosts[0](), "pt-cost", true, "small-buyable");
    displayButton(game.quarks, buyableCosts[1](), "pt-10-cost", true, "small-buyable");
    displayButton(game.quarks, buyableCosts[2](), "nt-cost", true, "small-buyable");
    displayButton(game.quarks, buyableCosts[3](), "nt-10-cost", true, "small-buyable");

}

function loop(delta) {
    game.lastTick = Date.now();
    game.quarks = game.quarks.add(calcProgressAdd(quarkGain().mul(quarkGainS()), delta));
    game.electrons = game.electrons.add(calcProgressAdd(0.5, delta));
    refresh();
}

function buyQuarksBuyable(buyID, wTD) {
    if (game.quarks.gte(buyableCosts[buyID]())) {
        game.quarks = game.quarks.sub(buyableCosts[buyID]());
        eval(wTD);
    }
}

function gainThings(wTD) {
    eval(wTD);
}

const calculate = window.setInterval(() => {
    deltaTime = Date.now() - game.lastTick;
    loop(deltaTime);
}, game.tickSpeed);