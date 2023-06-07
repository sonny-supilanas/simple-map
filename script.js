/**
 * @author Sonny Supilanas <sonny.supilanas@yahoo.com.ph>
 *  
 * This web app allow user to add, delete and search items to the map.
 * 
 * Using leafletjs @see {@link https://leafletjs.com/}
 * Using openstreetmap @see {@link https://www.openstreetmap.org}
 * Using heroicons @see {@link https://heroicons.com/}
 * */

'use strict';

class App {
    #map;
    #markers = [];
    #controls = [];
    #items = [];

    constructor() {
        //this._getGeolocation();
        this._loadMap();
        this._controlFullScreen();
        this._clearControl();
        this._defaultControl();
        this._createList("");
    }

    // _getGeolocation() {
    //     if (navigator.geolocation) {
    //         navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
    //             alert("Could not get geolocation.");
    //         });
    //     }
    // }

    _loadMap() {
        //const { latitude, longitude } = position.coords;
        //this.#map = L.map('map').setView([latitude, longitude], 13);
        this.#map = L.map('map').setView([24.453884, 54.377344], 6);//abu dhabi
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        this.#map.on("click", this._getCoord.bind(this));

    }

    /**
     * 
     * @param {object} obj 
     */
    _getCoord(obj) {
        let { lat, lng } = obj.latlng;

        const inputLatitude = document.querySelector(".latitude");
        const inputLongitude = document.querySelector(".longitude");

        //check first if element exist
        if (inputLatitude && inputLongitude) {
            inputLatitude.value = lat;
            inputLongitude.value = lng;
        }
    }

    _addItem() {
        const itemid = Math.floor(Math.random() * 1000000000);
        const item = document.querySelector(".new-item");
        const time = document.querySelector(".time");
        const inputLatitude = document.querySelector(".latitude");
        const inputLongitude = document.querySelector(".longitude");

        //check input fields
        if (item.value.trim().length == 0) return;
        if (!(inputLatitude.value >= -90 && inputLatitude.value <= 90)) return;
        if (!(inputLongitude.value >= -180 && inputLongitude.value <= 180)) return;

        const obj =
        {
            "itemid": itemid,
            "item": item.value,
            "group": "admin",
            "time": time.value,
            "latitude": inputLatitude.value,
            "longitude": inputLongitude.value
        }

        this._clearControl();
        this._defaultControl();
        this._showMarker(obj);
        this.#items.push(obj);
        this._store();
    }

    /**
     * 
     * @param {object} marker - leaflet markewiwindow.localStoragendow.localStorager object
     */
    _markerColor(marker) {
        //let colorStyle = marker.options.data.group === "red" ? "red-group" : "blue-group";
        let group = marker.options.data.group;
        let colorStyle;
        if (group === "red") colorStyle = "red-group";
        if (group === "blue") colorStyle = "blue-group";
        if (group === "admin") colorStyle = "admin-group";

        marker._icon.classList.add(colorStyle);
    }

    _showMarkers() {
        this.#items.forEach(element => {
            this._showMarker(element);
        });

    }

    /**
     * @param {object} data
     */
    _showMarker(data) {
        let { itemid, item, time, latitude, longitude, _group } = data;
        let html = `
                <p>
                    ${item}<br>
                    Time: ${time}<br>
                    Lat: ${latitude}<br>
                    Lng: ${longitude}<br>
                </p>
            `;
        let m = L.marker([latitude, longitude]).addTo(this.#map).bindPopup(html);

        //add some data for reference purposes
        m.options.data = {
            "itemid": itemid,
            "lat": latitude,
            "lng": longitude,
            "group": _group
        };
        this.#markers.push(m);//store markers for reference
        this._markerColor(m);

    }

    /**
     * 
     * @param {integer} arg - itemid
     * @returns 
     */
    _removeMarker(arg) {
        if (this.#markers.length == 0) return;
        const marker = this.#markers.find(element => element.options.data.itemid === Number(arg));

        this.#map.removeLayer(marker);

    }

    // _removeMarkers() {
    //     if (this.#markers.length === 0) return;
    //     this.#markers.forEach(element => {
    //         this.#map.removeLayer(element);
    //     });

    // }

    /**
     * @param {integer} itemid 
     * @param {integer} latitude 
     * @param {integer} longitude 
     */
    _centerPop(itemid, latitude, longitude) {
        this.#markers.forEach(marker => {
            if (marker.options.data.itemid === Number(itemid)) {
                marker.fire("click");
                this.#map.setView([latitude, longitude], 7, {
                    animate: true,
                    pan: {
                        duration: 1,
                    },
                });

            }

        });
    }

    /**
     * 
     * @param {integer} itemid
     */
    _deleteDb(itemid) {
        const index = this.#items.findIndex(element => element.itemid == Number(itemid));
        this.#items.splice(index, 1);
        this._store();
        this._removeMarker(itemid);
        this._clearControl();
        this._createList("delete");
    }

    /**
     * 
     * @param {string} arg - "list" or "delete"
     */
    _createHandler(arg) {
        const elements = document.querySelectorAll(".item");

        let previouslyClickedItem; //for background color cycling

        if (arg === "list") {
            elements.forEach(element => {
                element.addEventListener("click", (el) => {
                    if (previouslyClickedItem) previouslyClickedItem.target.style.backgroundColor = "";
                    el.target.style.backgroundColor = "beige";
                    previouslyClickedItem = el;
                    let { itemid, latitude, longitude } = element.dataset;
                    this._centerPop(itemid, latitude, longitude);
                });
            });
        }

        if (arg === "delete") {
            elements.forEach(element => {
                element.addEventListener("click", (el) => {
                    // if (previouslyClickedItem) previouslyClickedItem.target.style.backgroundColor = "";
                    // el.target.style.backgroundColor = "aliceblue";
                    // previouslyClickedItem = el;
                    let { itemid, item, latitude, longitude } = element.dataset;
                    this._centerPop(itemid, latitude, longitude);
                    // setTimeout(() => {
                    //     const result = confirm(`Delete item ${item}?`);
                    //     if (result) this._deleteDb(itemid);
                    // }, 300);
                    //this._deleteDb(itemid);
                    this._clearControl();
                    this._controlConfirmDeleteForm(itemid, item);
                });
            });
        }

    }

    /**
     * 
     * @param {string} arg - "list", "delete" and ""
     */
    _createList(arg) {

        if (arg == "") {
            if (this._getStore() == null) {
                this.#items = [];
                return;
            }
            this.#items = this._getStore();
            this._showMarkers();
        }
        if (arg === "list") this._controlListForm(this.#items);
        if (arg === "delete") this._controlDeleteForm(this.#items);
    }

    _clearControl() {
        this.#controls.forEach(control => {
            control.remove(this.#map);
        });
        //always clear controls array
        this.#controls = [];
    }

    _defaultControl() {
        this._controlAddItem();
        this._controlDelItem();
        this._controlListItem();
        //this._controlBookmark();
    }

    _controlAddForm() {
        L.Control.MyCustom = L.Control.extend({

            onAdd: function (map) {
                const container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
                const div = L.DomUtil.create("div", "form", container);
                div.innerHTML = `
                        <input class="new-item" placeholder="Item" maxlength="20"><br>
                        <input class="time" placeholder="Time" maxlength="20"><br>
                        <input class="latitude" type="number" placeholder="Latitude"><br>
                        <input class="longitude" type="number" placeholder="Longitude"><br>
                        <button class="button add-button">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" >
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <button class="button back">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                      
                        </button>

                `;
                L.DomEvent.disableClickPropagation(container);
                return container;
            },

            onRemove: function (map) {
                // Nothing to do here
            }
        });

        L.control.mycustom = (opts) => new L.Control.MyCustom(opts);
        //push control to array for reference
        this.#controls.push(L.control.mycustom({ position: "topright" }).addTo(this.#map));

        const cancel = document.querySelector(".back");
        cancel.addEventListener("click", e => {
            e.preventDefault();
            this._clearControl();
            this._defaultControl();
        });

        const addButt = document.querySelector(".add-button");
        addButt.addEventListener("click", (e) => {
            e.preventDefault();
            this._addItem();
        });
    }

    /**
     * 
     * @param {array} data - Array of object 
     */
    _controlListForm(data) {
        L.Control.MyCustom = L.Control.extend({

            onAdd: function () {
                //console.log(data);
                const container = L.DomUtil.create("div");
                const div = L.DomUtil.create("div", "list", container);

                data.forEach(element => {
                    let { itemid, item, time, latitude, longitude } = element;
                    let html = `
                        <div class="item" 
                        data-itemid="${itemid}" 
                        data-item="${item}"
                        data-time="${time}"
                        data-latitude="${latitude}" 
                        data-longitude="${longitude}">
                            ${item}
                        </div>
                        <hr>
                    `;
                    div.insertAdjacentHTML("beforeend", html);
                });

                const out = `
                    <button class="button cancel">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                `;
                div.insertAdjacentHTML("afterbegin", out);
                L.DomEvent.disableClickPropagation(container);
                return container;
            },

            onRemove: function (map) {
                // Nothing to do here
            }
        });

        L.control.mycustom = (opts) => new L.Control.MyCustom(opts);
        //push control to array for reference
        this.#controls.push(L.control.mycustom({ position: "topright" }).addTo(this.#map));

        this._createHandler("list");

        const cancel = document.querySelector(".cancel");
        cancel.addEventListener("click", e => {
            e.preventDefault();
            this._clearControl();
            this._defaultControl();
        });
    }

    /**
     * 
     * @param {integer} itemid 
     * @param {string} item 
     */
    _controlConfirmDeleteForm(itemid, item) {
        L.Control.MyCustom = L.Control.extend({

            onAdd: function () {
                //console.log(data);
                const container = L.DomUtil.create("div");
                const div = L.DomUtil.create("div", "delete", container);

                //let { itemid, item, time, latitude, longitude } = element;
                let html = `
                    <div>
                        Delete "<span class="emphasis">${item}</span>" ?
                    </div>
                    <hr>
                    <div class="confirm-delete">
                        <button class="button delete-yes">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </button>
                    </div>
                `;
                div.insertAdjacentHTML("beforeend", html);

                const out = `
                    <button class="button cancel">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                `;
                div.insertAdjacentHTML("afterbegin", out);
                L.DomEvent.disableClickPropagation(container);
                return container;
            },

            onRemove: function (map) {
                // Nothing to do here
            }
        });

        L.control.mycustom = (opts) => new L.Control.MyCustom(opts);
        //push control to array for reference
        this.#controls.push(L.control.mycustom({ position: "topright" }).addTo(this.#map));

        //this._createHandler("delete");

        const cancel = document.querySelector(".cancel");
        cancel.addEventListener("click", e => {
            e.preventDefault();
            this._clearControl();
            this._controlDeleteForm(this.#items);
        });

        const deleteYes = document.querySelector(".delete-yes");
        deleteYes.addEventListener("click", () => {
            setTimeout(this._deleteDb(itemid), 3000);
        });
    }

    /**
     * 
     * @param {array} data - Array of object 
     */
    _controlDeleteForm(data) {
        L.Control.MyCustom = L.Control.extend({

            onAdd: function () {
                //console.log(data);
                const container = L.DomUtil.create("div");
                const div = L.DomUtil.create("div", "delete", container);

                data.forEach(element => {
                    let { itemid, item, time, latitude, longitude } = element;
                    let html = `
                        <div class="item" 
                        data-itemid="${itemid}" 
                        data-item="${item}"
                        data-time="${time}"
                        data-latitude="${latitude}" 
                        data-longitude="${longitude}">
                            ${item}
                        </div>
                        <hr>
                    `;
                    div.insertAdjacentHTML("beforeend", html);
                });

                const out = `
                    <button class="button cancel">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                `;
                div.insertAdjacentHTML("afterbegin", out);
                L.DomEvent.disableClickPropagation(container);
                return container;
            },

            onRemove: function (map) {
                // Nothing to do here
            }
        });

        L.control.mycustom = (opts) => new L.Control.MyCustom(opts);
        //push control to array for reference
        this.#controls.push(L.control.mycustom({ position: "topright" }).addTo(this.#map));

        this._createHandler("delete");

        const cancel = document.querySelector(".cancel");
        cancel.addEventListener("click", e => {
            e.preventDefault();
            this._clearControl();
            this._defaultControl();
        });
    }

    _controlAddItem() {
        L.Control.AddItem = L.Control.extend({

            onAdd: function (map) {
                const container = L.DomUtil.create("div");
                const div = L.DomUtil.create("div", "", container);
                div.innerHTML = `
                <button class="button plus-button">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </button>
                `;
                L.DomEvent.disableClickPropagation(container);
                return container;
            },

            onRemove: function (map) {
                // Nothing to do here
            }
        });

        L.control.additem = (opts) => new L.Control.AddItem(opts);
        //push control to array for reference
        this.#controls.push(L.control.additem({ position: "topright" }).addTo(this.#map));

        const plusButt = document.querySelector(".plus-button");

        plusButt.addEventListener("click", (e) => {
            e.preventDefault();
            this._clearControl();
            this._controlAddForm();
        });
    }

    _controlListItem() {
        L.Control.ListItem = L.Control.extend({

            onAdd: function (map) {

                const container = L.DomUtil.create("div");
                const div = L.DomUtil.create("div", "", container);
                div.innerHTML = `
                    <button class="button list-button">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </button>
                `;
                L.DomEvent.disableClickPropagation(container);
                return container;
            },

            onRemove: function (map) {
                // Nothing to do here
            }
        });

        L.control.listitem = (opts) => new L.Control.ListItem(opts);
        this.#controls.push(L.control.listitem({ position: "topright" }).addTo(this.#map));

        const listButt = document.querySelector(".list-button");

        listButt.addEventListener("click", (e) => {
            e.preventDefault();
            this._clearControl();
            this._createList("list");
        });
    }

    _controlDelItem() {
        L.Control.DelItem = L.Control.extend({

            onAdd: function (map) {

                const container = L.DomUtil.create("div");
                const div = L.DomUtil.create("div", "", container);
                div.innerHTML = `
                <button class="button delete-button">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                </button>
                `;
                L.DomEvent.disableClickPropagation(container);
                return container;
            },

            onRemove: function (map) {
                // Nothing to do here
            }
        });

        L.control.delitem = (opts) => new L.Control.DelItem(opts);
        this.#controls.push(L.control.delitem({ position: "topright" }).addTo(this.#map));

        const deleteButt = document.querySelector(".delete-button");

        deleteButt.addEventListener("click", (e) => {
            e.preventDefault();
            this._clearControl();
            this._createList("delete");
        });
    }

    // _controlBookmark() {
    //     L.Control.Logout = L.Control.extend({

    //         onAdd: function (map) {

    //             const container = L.DomUtil.create("div");
    //             const div = L.DomUtil.create("div", "", container);
    //             div.innerHTML = `
    //                 <button class="button bookmark-button">
    //                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    //                         <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    //                     </svg>
    //                 </button>
    //             `;
    //             L.DomEvent.disableClickPropagation(container);
    //             return container;
    //         },

    //         onRemove: function (map) {
    //             // Nothing to do here
    //         }
    //     });

    //     L.control.logout = (opts) => new L.Control.Logout(opts);
    //     this.#controls.push(L.control.logout({ position: "topright" }).addTo(this.#map));

    //     const bookmarkButt = document.querySelector(".bookmark-button");

    //     bookmarkButt.addEventListener("click", (e) => {
    //         e.preventDefault();
    //     });
    // }

    _store() {
        window.localStorage.setItem("data", JSON.stringify(this.#items));
    }

    _getStore() {
        const d = window.localStorage.getItem("data");
        return JSON.parse(d);
    }

    _fullScreen() {

        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }

    }

    _controlFullScreen() {
        L.Control.FullScreen = L.Control.extend({

            onAdd: function (map) {
                const container = L.DomUtil.create("div");
                const div = L.DomUtil.create("div", "", container);
                div.innerHTML = `
                <button class="button fullscreen-button">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
                `;
                L.DomEvent.disableClickPropagation(container);
                return container;
            },

            onRemove: function (map) {
                // Nothing to do here
            }
        });

        L.control.fullscreen = (opts) => new L.Control.FullScreen(opts);
        L.control.fullscreen({ position: "topleft" }).addTo(this.#map);

        const fullscreen = document.querySelector(".fullscreen-button");

        fullscreen.addEventListener("click", (e) => {
            e.preventDefault();
            this._fullScreen();
        });
    }
}


const app = new App();
