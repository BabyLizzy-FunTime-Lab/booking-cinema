// Element selector functions
function elementClass(classname) {
    return document.getElementsByClassName(classname);
}

function elementID(id) {
    return document.getElementById(id);
}

// Find room where movie is played
function roomFinder(movie) {
    switch (movie) {
        case "The Predator":
            return room_1;
            break;
        case "Airplane":
            return room_2;
            break;
        default:
            console.log("Movie/Room not found");
    }
}

// This creates the theater room element with all the seats, no style
function renderRoom(room) {
    // create room container
    let room_div = document.createElement("div");
    room_div.id = "theater-room";
    room.forEach(function(row, row_nr) {
        // create a row container
        let row_div = document.createElement("div");
        row_div.className = "row";
        row_div.id = "row-" + row_nr;
        // create seats and asign proper name and class
        row.forEach(function(seatobject) {
                let seat_div = document.createElement("div");
                seat_div.className = "seat"
                seat_div.id = seatobject.number;
                seat_div.innerText = seatobject.number;
                if (seatobject.ticketnr === '') {
                    seat_div.className += " seatOpen";
                } else {
                    seat_div.className += " seatTaken";
                }
                row_div.appendChild(seat_div);
            })
            // Insert row with seats into room
        room_div.appendChild(row_div);
    })
    return room_div;
}

// This function checks if 2 arrays have the same values regardless of order.
function compareArrays(array1, array2) {
    let array1_sorted = array1.slice().sort();
    let array2_sorted = array2.slice().sort();

    if (array1_sorted.length === array2_sorted.length && array2_sorted.every((value, index) => value === array1_sorted[index])) {
        return true;
    } else {
        return false;
    }
}
// This function checks if there are reserved seats in the searcharray
function excludeFoundSeats(array1, array2) {
    let check = 0;
    array2.forEach((value) => {
        if (array1.includes(value)) {
            check++;
        }
    })
    if (check > 0) {
        return false;
    } else {
        return true;
    }
}
// This function checks if there are reserved seats in the searcharray
// The catch is that array1 is and array of objects.
function excludeFoundSeats(objectArray, array) {
    let check = 0;
    let extractedSeatsArray = [];
    objectArray.forEach((seatObject) => extractedSeatsArray.push(seatObject.number));
    array.forEach((value) => {
        if (extractedSeatsArray.includes(value)) {
            check++;
        }
    })
    if (check > 0) {
        return false;
    } else {
        return true;
    }
}
// let arraytest1 = ["20", "36", "80", "90"];
// let arraytest2 = ["36", "90", "80", "20"];
// let arraytest3 = ["100", "90", "110", "20"];
// let arraytest4 = ["100", "92", "110", "25"];
// let arraytest6 = [];
// let arraytest5 = [
//     { number: '20', ticketnr: '' },
//     { number: '36', ticketnr: '1' },
//     { number: '90', ticketnr: '2' },
//     { number: '80', ticketnr: '' }
// ];

// if (excludeFoundSeats(arraytest5, arraytest3)) {
//     console.log("Array has no reserved seats.");
// } else {
//     console.log("A reserved seat was found.");
// }
// if (excludeFoundSeats(arraytest5, arraytest6)) {
//     console.log("Array has no reserved seats.");
// } else {
//     console.log("A reserved seat was found.");
// }

let remainingSeats = 0;
let nrSeatsNeeded = 0;
let return_array = [];

// This funtion looks for available seats
async function seatFinder(groupsize, theaterroom) {
    const total_rows = theaterroom.length;
    const center_row = Math.round(total_rows / 2);
    const best_rows = [center_row, (center_row + 1), (center_row + 2)];
    
    if (nrSeatsNeeded == 0) {
        nrSeatsNeeded = groupsize;
        return_array = [];
        remainingSeats = 0;
    }

    let posible_seating = [];
    let best_seats = [];
    let secondbest_seats = [];
    let thirdbest_seats = [];

    // loop rows This can be a function to be reused.
    theaterroom.forEach(function(row_array, row_nr) {
        let current_row = row_nr;
        row_array.forEach(function(seat) {
            // add row to seat object and push to posible_seating
            seat["seat_row"] = current_row;
            posible_seating.push(seat);
            if (posible_seating.length == groupsize) {
                // check if all available
                if (posible_seating.every((seat) => seat.ticketnr === '' && seat.seat_row == current_row ? true : false) && excludeFoundSeats(posible_seating, return_array)) {
                    let push_array = [];
                    posible_seating.forEach(function(bookedseat) {
                        switch (true) {
                            case current_row === best_rows[0] || current_row === best_rows[1] || current_row === best_rows[2]:
                                push_array.push(bookedseat.number);
                                if (push_array.length === posible_seating.length) {
                                    best_seats.push(push_array);
                                }
                                break;
                            case current_row > best_rows[2]:
                                push_array.push(bookedseat.number);
                                if (push_array.length === posible_seating.length) {
                                    secondbest_seats.push(push_array);
                                }
                                break;
                            case current_row < best_rows[0]:
                                push_array.push(bookedseat.number);
                                if (push_array.length === posible_seating.length) {
                                    thirdbest_seats.push(push_array);
                                }
                                break;
                            default:
                                console.log("Row classification err");
                        }
                    })
                    posible_seating.splice(0, 1);
                } else {
                    // This leaves seats in posible_seating that could be usefull in the next loop.
                    posible_seating.reverse().forEach(function(seat, index) {
                        if (seat.ticketnr === '' && seat.seat_row == current_row) {
                            return;
                        } else {
                            posible_seating.splice(index);
                            posible_seating.reverse();
                        }
                    })
                }
            }
        })
    })

    // Need to keep track of how many seats are found.
    // Should return when return_array.length maches seat found.

    if (best_seats.length > 0) {
        return_array.push(best_seats[0]);
        if (return_array.length == nrSeatsNeeded) {
            console.log(return_array);
            nrSeatsNeeded = 0;
            return return_array;
        } else {
            seatFinder(remainingSeats, theaterroom);
        }
    } else if (secondbest_seats.length > 0) {
        return_array.push(secondbest_seats[0]);
        if (return_array.length == nrSeatsNeeded) {
            console.log(return_array);
            nrSeatsNeeded = 0;
            return return_array;
        } else {
            seatFinder(remainingSeats, theaterroom);
        }
    } else if (thirdbest_seats.length > 0) {
        return_array.push(thirdbest_seats[0]);
        if (return_array.length == nrSeatsNeeded) {
            console.log(return_array);
            nrSeatsNeeded = 0;
            return return_array;
        } else {
            seatFinder(remainingSeats, theaterroom);
        }
    } else {
        // alert("No match found, please reduce groupsize and try again");
        remainingSeats++;
        if(remainingSeats == nrSeatsNeeded) {
            return null;
        }
        console.log("Seats left: " + remainingSeats);
        seatFinder((groupsize - 1), theaterroom);
        // return null;
    }
}

function showSeats(selected_room, foundseats) {
    let overview = document.getElementById('seats-overview');
    let room = document.getElementById('theater-room');
    if (room) {
        room.remove();
    }
    overview.appendChild(renderRoom(selected_room));
    if (foundseats.length == 1) {
        foundseats[0].forEach(function(advised_seat) {
            elementID(advised_seat).className = "seat seatAdvised";
        })
    } else if (foundseats.length > 1) {
        // This compansates if the seat search gets broken up in parts.
        foundseats.forEach(function(seat_group) {
            seat_group.forEach(function(advised_seat) {
                elementID(advised_seat).className = "seat seatAdvised";
            })
        })
    } else {
        alert("No seating posibilities found. Please reduce groupsize.");
    }
}

// Set group size limit
Array.from(elementClass('movies')).forEach(function(movie) {
    movie.addEventListener("click", function(event) {
        let row_length = roomFinder(movie.value)[0].length;
        elementID("groupsize").setAttribute("max", row_length.toString());
        elementID("groupsize").value = 1;
    })
})

// Referance and copy of the theaterroom.
let selected_room;
let selected_room_copy;
//Eventhandeler book-btn
elementID("book-btn").addEventListener("click", function(event) {
        let num_seats = elementID("groupsize").value;

        // check radio input & find theatherroom
        Array.from(elementClass('movies')).forEach(function(movie) {
            if (movie.checked) {
                selected_room = roomFinder(movie.value);
                // Copy selected_room with Lodash library
                selected_room_copy = selected_room.map(a => {
                    let deepcopy = _.cloneDeep(a);
                    return [...deepcopy];
                });
            }
        })
        seatFinder(num_seats, selected_room_copy).then(
            function(value) {
                console.log(value);
                showSeats(selected_room, value);
            }
        );
        // showSeats(selected_room, seatFinder(num_seats, selected_room_copy));
    })
    // I'm missing a recuring function that keeps searching and updating selected_room_copy.
    // seatFinder(groupsize, theaterroom) needs to be a recuring function. I plan on using
    // the groupsize argument as a countdown to stop the loop.
    // As backup I will set a loop limiter that will return null. 
    // After getting the proper seats, update the original selcted_room array.
    // adding ticketnr after booking confirmation.
    // bookedseat.ticketnr = Math.floor(Math.random() * 10000);

// These are the theaterrooms.
let room_1 = [
    // row 1
    [
        { number: '1', ticketnr: '1' },
        { number: '2', ticketnr: '2' },
        { number: '3', ticketnr: '' },
        { number: '4', ticketnr: '3' },
        { number: '5', ticketnr: '' },
        { number: '6', ticketnr: '' },
        { number: '7', ticketnr: '4' },
        { number: '8', ticketnr: '' },
        { number: '9', ticketnr: '' }
    ],
    // row 2
    [
        { number: '10', ticketnr: '' },
        { number: '11', ticketnr: '' },
        { number: '12', ticketnr: '' },
        { number: '13', ticketnr: '' },
        { number: '14', ticketnr: '' },
        { number: '15', ticketnr: '' },
        { number: '16', ticketnr: '' },
        { number: '17', ticketnr: '' },
        { number: '18', ticketnr: '' }
    ],
    // row 3
    [
        { number: '19', ticketnr: '5' },
        { number: '20', ticketnr: '6' },
        { number: '21', ticketnr: '7' },
        { number: '22', ticketnr: '8' },
        { number: '23', ticketnr: '' },
        { number: '24', ticketnr: '' },
        { number: '25', ticketnr: '' },
        { number: '26', ticketnr: '' },
        { number: '27', ticketnr: '' }
    ],
    // row 4
    [
        { number: '28', ticketnr: '49' },
        { number: '29', ticketnr: '' },
        { number: '30', ticketnr: '50' },
        { number: '31', ticketnr: '11' },
        { number: '32', ticketnr: '' },
        { number: '33', ticketnr: '' },
        { number: '34', ticketnr: '2' },
        { number: '35', ticketnr: '' },
        { number: '36', ticketnr: '' }
    ],
    // row 5
    [
        { number: '37', ticketnr: '12' },
        { number: '38', ticketnr: '34' },
        { number: '39', ticketnr: '56' },
        { number: '40', ticketnr: '78' },
        { number: '41', ticketnr: '45' },
        { number: '42', ticketnr: '43' },
        { number: '43', ticketnr: '' },
        { number: '44', ticketnr: '' },
        { number: '45', ticketnr: '' }
    ],
    // row 6
    [
        { number: '46', ticketnr: '' },
        { number: '47', ticketnr: '' },
        { number: '48', ticketnr: '' },
        { number: '49', ticketnr: '' },
        { number: '50', ticketnr: '' },
        { number: '51', ticketnr: '4' },
        { number: '52', ticketnr: '5' },
        { number: '53', ticketnr: '8' },
        { number: '54', ticketnr: '9' }
    ],
    // row 7
    [
        { number: '55', ticketnr: '' },
        { number: '56', ticketnr: '' },
        { number: '57', ticketnr: '' },
        { number: '58', ticketnr: '78' },
        { number: '59', ticketnr: '89' },
        { number: '60', ticketnr: '' },
        { number: '61', ticketnr: '90' },
        { number: '62', ticketnr: '' },
        { number: '63', ticketnr: '' }
    ],
    // row 8
    [
        { number: '64', ticketnr: '' },
        { number: '65', ticketnr: '' },
        { number: '66', ticketnr: '' },
        { number: '67', ticketnr: '' },
        { number: '68', ticketnr: '67' },
        { number: '69', ticketnr: '' },
        { number: '70', ticketnr: '' },
        { number: '71', ticketnr: '' },
        { number: '72', ticketnr: '' }
    ],
    // row 9
    [
        { number: '73', ticketnr: '21' },
        { number: '74', ticketnr: '' },
        { number: '75', ticketnr: '32' },
        { number: '76', ticketnr: '' },
        { number: '77', ticketnr: '' },
        { number: '78', ticketnr: '89' },
        { number: '79', ticketnr: '90' },
        { number: '80', ticketnr: '' },
        { number: '81', ticketnr: '' }
    ],
    // row 10
    [
        { number: '82', ticketnr: '' },
        { number: '83', ticketnr: '73' },
        { number: '84', ticketnr: '' },
        { number: '85', ticketnr: '' },
        { number: '86', ticketnr: '' },
        { number: '87', ticketnr: '' },
        { number: '88', ticketnr: '' },
        { number: '89', ticketnr: '' },
        { number: '90', ticketnr: '' }
    ]
];

let room_2 = [
    // row 1
    [
        { number: '1', ticketnr: '' },
        { number: '2', ticketnr: '1' },
        { number: '3', ticketnr: '2' },
        { number: '4', ticketnr: '' },
        { number: '5', ticketnr: '' },
        { number: '6', ticketnr: '3' },
        { number: '7', ticketnr: '4' },
        { number: '8', ticketnr: '' }
    ],
    // row 2
    [
        { number: '9', ticketnr: '' },
        { number: '10', ticketnr: '' },
        { number: '11', ticketnr: '' },
        { number: '12', ticketnr: '' },
        { number: '13', ticketnr: '' },
        { number: '14', ticketnr: '23' },
        { number: '15', ticketnr: '' },
        { number: '16', ticketnr: '' }
    ],
    // row 3
    [
        { number: '17', ticketnr: '' },
        { number: '18', ticketnr: '' },
        { number: '19', ticketnr: '' },
        { number: '20', ticketnr: '' },
        { number: '21', ticketnr: '7' },
        { number: '22', ticketnr: '8' },
        { number: '23', ticketnr: '9' },
        { number: '24', ticketnr: '10' }
    ],
    // row 4
    [
        { number: '25', ticketnr: '11' },
        { number: '26', ticketnr: '12' },
        { number: '27', ticketnr: '13' },
        { number: '28', ticketnr: '14' },
        { number: '29', ticketnr: '15' },
        { number: '30', ticketnr: '16' },
        { number: '31', ticketnr: '' },
        { number: '32', ticketnr: '' }
    ],
    // row 5
    [
        { number: '33', ticketnr: '' },
        { number: '34', ticketnr: '' },
        { number: '35', ticketnr: '' },
        { number: '36', ticketnr: '' },
        { number: '37', ticketnr: '17' },
        { number: '38', ticketnr: '18' },
        { number: '39', ticketnr: '19' },
        { number: '40', ticketnr: '' }
    ],
    // row 6
    [
        { number: '41', ticketnr: '' },
        { number: '42', ticketnr: '' },
        { number: '43', ticketnr: '20' },
        { number: '44', ticketnr: '21' },
        { number: '45', ticketnr: '22' },
        { number: '46', ticketnr: '23' },
        { number: '47', ticketnr: '' },
        { number: '48', ticketnr: '' }
    ],
    // row 7
    [
        { number: '49', ticketnr: '' },
        { number: '50', ticketnr: '' },
        { number: '51', ticketnr: '' },
        { number: '52', ticketnr: '24' },
        { number: '53', ticketnr: '25' },
        { number: '54', ticketnr: '26' },
        { number: '55', ticketnr: '' },
        { number: '56', ticketnr: '' }
    ],
    // row 8
    [
        { number: '57', ticketnr: '' },
        { number: '58', ticketnr: '' },
        { number: '59', ticketnr: '' },
        { number: '60', ticketnr: '' },
        { number: '61', ticketnr: '' },
        { number: '62', ticketnr: '' },
        { number: '63', ticketnr: '27' },
        { number: '64', ticketnr: '28' }
    ]
];