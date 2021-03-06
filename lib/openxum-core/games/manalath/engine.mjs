"use strict";

import Coordinates from "./coordinates.mjs";
import Intersection from "./intersection.mjs";
import OpenXum from '../../openxum/engine.mjs';
import Piece from './piece.mjs';
import Player from './player.mjs';
import State from './state.mjs';
import Color from './color.mjs';
import Move from './move.mjs';

// enums definition
const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];


class Engine extends OpenXum.Engine {
    constructor(type, current_color) {
        super();
        this._type = type;
        this._current_color = current_color;
        this._black_piece_count = 30;
        this._white_piece_count = 30;
        this._intersections = [];
        this._end = false;
        this._player_end = false;
        this._listeners = [];

        this._init_board();
    }

    // api methods

    apply_moves(moves) {

    }

    clone() {
        let e = new Engine(this._type, this._current_color);
        e._set(this._black_piece_count, this._white_piece_count, this._intersections);
        return e;
    }

    current_color() {
        return this._current_color;
    }

    get_name() {
        return "Manalath";
    }

    get_possible_move_list(color) {
        if(color === null || color === undefined) {
            // random color
            color = Math.floor(Math.random() * 2) === 0 ? Color.WHITE : Color.BLACK;
        }
         return this._get_array_moves(color);
    }

    is_finished() {
        let ancient_player = this.current_color() === Player.PLAYER_1 ? Player.PLAYER_2 : Player.PLAYER_1;
        for (let i in this._intersections) {
            this._clear_marks_intersection();
            let inter = this._intersections[i];

            if (inter.get_state() === State.VACANT || inter.get_color() !== ancient_player) {
                continue;
            }

            let nb_pieces_same_color = this._count_neighbor_same_color(inter.get_coordinates(), ancient_player, true);
            this._clear_marks_intersection();

            if (nb_pieces_same_color === 4) {
                this._end = 0;
                this._player_end = ancient_player;
                return true;
            }
            if (nb_pieces_same_color === 5) {
                this._end = 1;
                this._player_end = ancient_player;
                return true;
            }
        }

        return false;

    }

    move(move) {
        let c2 = move.to();
        let chosen_color = move.chosen_color();
        let inter_dest = this.get_intersection(c2);

        if(!this._is_move_valid(c2, chosen_color)) {
            this._clear_marks_intersection();
            return false;
        }

        inter_dest.set_piece(new Piece(chosen_color));

        if(chosen_color === Color.WHITE) {
            --this._white_piece_count;
        } else {
            --this._black_piece_count;
        }

        this.notify_listeners();

        this._switch_player();
        this._clear_marks_intersection();

        return true;
    }

    parse(str) {

    }

    to_string() {

    }

    winner_is() {
        if(this._end === 0) {
            return this._player_end === Player.PLAYER_1 ? Player.PLAYER_2 : Player.PLAYER_1;
        } else {
            return this._player_end;
        }
    }

    get_intersection(coord,c, l) {
        if(coord) {
            return this._intersections[coord.hash()];
        }
        return this._intersections[new Coordinates(c, l).hash()];
    }

    add_listener(listener) {
        this._listeners.push(listener);
    }

    notify_listeners() {
        this._listeners.forEach((listener) => {
            listener.piece_count_changed(this._white_piece_count, this._black_piece_count);
        });
    }

    // private methods

    _exist_intersection(letter, number) {
        let coordinates = new Coordinates(letter, number);

        if (coordinates.is_valid()) {
            return this._intersections[coordinates.hash()] !== null;
        } else {
            return false;
        }
    }

    _set(black_pieces_count, white_pieces_count, intersections) {
        this._black_piece_count = black_pieces_count;
        this._white_piece_count = white_pieces_count;

        for (let i in intersections) {
            this._intersections[i] = intersections[i].clone();
        }
    }

    _get_array_moves(color) {
        let possible_moves = [];
        for (let i in this._intersections) {
            this._clear_marks_intersection();
            let inter = this._intersections[i];

            if ( inter.get_state() !== State.VACANT ||
                (this._count_neighbor_same_color(inter.get_coordinates(), color, true) >= 6)
            ) {
                continue;
            }

            possible_moves.push(new Move(inter.get_coordinates(), color));
        }

        this._clear_marks_intersection();
        return possible_moves;
    }


    _clear_marks_intersection() {
        for (let i in this._intersections){
            this._intersections[i].clear_mark();
        }
    }

    _is_move_valid(coord, chosen_color) {
        if( (chosen_color === Color.BLACK && this._black_piece_count === 0) ||
            (chosen_color === Color.WHITE && this._white_piece_count === 0) ||
            chosen_color === Color.NONE
        ) {
            return false;
        }

        return this._count_neighbor_same_color(coord, chosen_color, true) < 6;
    }

    _count_neighbor_same_color(coord, colorOrigin, first) {
        let inter = this.get_intersection(coord);
        let color = inter.get_color();

        if(!first && (color !== colorOrigin || inter.is_marked())) {
            return 0;
        }

        let current_line = inter.get_line();
        let current_column = inter.get_column();
        let nb_piece_same_color = 1;
        inter.set_marked();

        for(let dir = 0; dir < 6 ; dir++) {
            let neighborCoord = this._get_neighbor_coord(current_line, current_column, dir);
            let neighborInter = false;
            if(neighborCoord) {
                neighborInter = this.get_intersection(neighborCoord);
            }
            if (
                neighborInter &&
                !neighborInter.is_marked() &&
                neighborInter.get_color() === colorOrigin
            ) {
                nb_piece_same_color += this._count_neighbor_same_color(neighborCoord, colorOrigin, false);
            }
        }

        return nb_piece_same_color;
    }

    _get_neighbor_coord(line, column, dir) {
        let neighbors = [
            [line + 1, column],
            [line - 1, column],
            [line + 1, String.fromCharCode(column.charCodeAt(0) + 1)],
            [line, String.fromCharCode(column.charCodeAt(0) - 1)],
            [line, String.fromCharCode(column.charCodeAt(0) + 1)],
            [line - 1, String.fromCharCode(column.charCodeAt(0) - 1)]
        ];

        line = neighbors[dir][0];
        column = neighbors[dir][1];
        let neighborCoord = new Coordinates(column, line);
        if(neighborCoord.is_valid()) {
            return neighborCoord;
        }

        return null;
    }


    _switch_player() {
        this._current_color = this._current_color === Color.WHITE ? Color.BLACK : Color.WHITE;
    }

    _init_board() {
        let i, line, coord;
        for (i = 0; i < letters.length; i++) {
            for (line = 0; line < 9; line += 1) {
                coord = new Coordinates(letters[i], line);
                this._initialize_inter(coord);
            }
        }
    }

    _initialize_inter(coord) {
        if(coord.is_valid()) {
            this._intersections[coord.hash()] = new Intersection(coord);
        }
    }
}

export default Engine;