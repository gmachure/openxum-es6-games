"use strict";

import OpenXum from '../../openxum/manager.mjs';
import Manalath from '../../../openxum-core/games/manalath/index.mjs';
import Color from '../../../openxum-core/games/manalath/color.mjs';

class Manager extends OpenXum.Manager {
    constructor(e, g, o, s) {
        super(e, g, o, s);
        this.that(this);
    }

    build_move() {
        return new Manalath.Move();
    }

    get_current_color() {
        return this.engine().current_color() === Color.WHITE ? 'White' : 'Black';
    }

    static get_name() {
        return 'manalath';
    }

    get_winner_color() {
        return this.engine().winner_is() === Color.WHITE ? 'White' : 'Black';
    }

    process_move() { }
}

export default {
    Manager: Manager
};