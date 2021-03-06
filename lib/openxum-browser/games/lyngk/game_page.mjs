"use strict";

import OpenXum from '../../openxum/game_page.mjs';
import Color from '../../../openxum-core/games/lyngk/color.mjs';


class GamePage extends OpenXum.GamePage {
    constructor(namespace, name, first_color, color, opponent_color, game_type, game_id,
                mode, username, owner_id, opponent_id, replay) {
        super(namespace, name, first_color, color, opponent_color, game_type, game_id, mode, username, owner_id,
            opponent_id, replay);

        $('body').on('contextmenu', 'canvas', function(e){ return false; });
        this._engine.addListener(this);
        this._engine.addListener(this._gui);

        $("#replay").unbind('click');
        $("#replay").click(() => {
            let moves = this._manager.get_moves();
            this.build_engine(namespace, mode, first_color, name, game_type, null, true);
            this.build_gui(namespace, color, game_id);
            this.build_opponent(namespace, color, game_type, game_id, opponent_color, username, owner_id, opponent_id);
            this.build_manager(namespace);
            this.set_gui();
            this.set_opponent(game_id);
            this._manager.replay(moves, true);
        });
    }

    build_buttons() {
        let row = $('<div/>', {class: 'row'});
        let col = $('<div/>', {class: 'col-md-3'});
        let main = $('#main');

        $('<a/>', {class: 'btn btn-success btn-md active', id: 'status', href: '#', html: 'Ready!'}).appendTo(col);
        $('<a/>', {class: 'btn btn-warning btn-md active', id: 'replay', href: '#', html: 'Replay'}).appendTo(col);
        $('<a/>', {
            class: 'btn btn-danger btn-md active', id: 'list', href: '#', html: 'Move list',
            'data-toggle': 'modal', 'data-target': '#moveListModal'
        }).appendTo(col);
        col.appendTo(row);

        let div = $('<div/>', {class: 'form-group col-md-9'});
        let list = $('<select/>', {class: 'form-control col-md-2', id: 'colors', style: 'display: inline;'});

        list.appendTo(div);
        let claimButton = $('<button/>', {class: 'btn btn-success btn-md active col-md-1', id: 'claim', href: '#',
            html: 'Claim'}).appendTo(div);

        let that = this;
        claimButton.click(function() {
            let selectedColor = $('#colors').val();

            if (!selectedColor) {
                return;
            }

            that._gui._on_claim_click(selectedColor);
        });
        div.appendTo(row);
        row.appendTo(main);
    }

    build_engine(namespace, mode, color, name, game_type, color_player, not_first) {
        if(not_first === true) {
            this._engine._reset();
        } else {
            super.build_engine(namespace, mode, color, name, game_type, color_player);
            this.postEngineEvents();
        }
    }

    postEngineEvents() {
        this.availableColorsUpdated(this._engine.getAvailableColors());
    }

    /*removeClaimColor(selectedColor) {
        let selector = "#colors option[value='" + selectedColor + "']";
        $(selector).remove();
    }*/

    add_link_to_list(list, value, label) {
        let option = $('<option/>', {value : value, html: label});
        option.appendTo(list);
    }

    availableColorsUpdated(availableColors) {
        let that = this;
        let list = $('#colors');
        list.find("option").remove();

        availableColors.forEach(function(color) {
            that.add_link_to_list(list, color, that.get_color_label(color));
        });
    }

    get_color_label(color) {
        switch (color) {
            case Color.WHITE:
                return "Blanc";
            case Color.BLACK:
                return "Noir";
            case Color.BLUE:
                return "Bleu";
            case Color.GREEN:
                return "Vert";
            case Color.IVORY:
                return "Ivoire";
            case Color.RED:
                return "Rouge";
            default:
                return "?";
        }
    }
}

export default {
    GamePage : GamePage
}