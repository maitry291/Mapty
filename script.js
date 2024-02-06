'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const error = function () {
  alert(`Not successful..!`);
};

// let map, mapEvent;

class App {
  workouts = [];
  #map;
  #mapEvent;

  constructor() {
    this._getPosition();
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
    form.addEventListener('submit', this._newWorkout.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), error);
    }
  }
  _loadMap(position) {
    console.log(position);
    const { latitude, longitude } = position.coords;
    // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13); //13 is zoom level of map showing on screen

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker(coords).addTo(this.#map).bindPopup('You are here👋🏻').openPopup();
    // this._showForm();
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();
    //clear input fields
    inputDistance.value = inputDuration.value = inputCadence.value = ``;
    const { lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 50,
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup',
        })
      )
      .setPopupContent(inputType.textContent)
      .openPopup();
  }
}

const app = new App();
