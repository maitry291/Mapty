'use strict';

// prettier-ignore

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

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  popupContent = ``;
  clicks = 0;
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; //in km
    this.duration = duration; //in min
  }

  click() {
    this.click++;
  }
}

class Running extends Workout {
  type = `running`;
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = `cycling`;
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration * 60);
    return this.speed;
  }
}

//Application Architecture
class App {
  workouts = [];
  #map;
  #mapEvent;
  #mapZoomLev = 13;

  constructor() {
    this._getPosition();
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
    form.addEventListener('submit', this._newWorkout.bind(this));
    containerWorkouts.addEventListener('click', this._moveToPoppup.bind(this));
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

    this.#map = L.map('map').setView(coords, this.#mapZoomLev); //13 is zoom level of map showing on screen

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
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const checkPositive = (...inputs) => inputs.every(inp => inp > 0);

    //get data from form
    const { lat, lng } = this.#mapEvent.latlng;
    const coords = [lat, lng];
    const dist = +inputDistance.value; //+ converts it to number
    const duration = +inputDuration.value;
    const type = inputType.value;

    //create workout acc to type
    let workout;
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //check if data is valid
      if (
        !validInputs(dist, duration, cadence) ||
        !checkPositive(dist, duration, cadence)
      )
        return alert(`Inputs have to be positive numbers`);

      workout = new Running(coords, dist, duration, cadence);
    } else if (type === 'cycling') {
      const elevation = +inputElevation.value;
      //check if data is valid
      if (
        !validInputs(dist, duration, elevation) ||
        !checkPositive(dist, duration)
      )
        return alert(`Inputs have to be positive numbers`);

      workout = new Cycling(coords, dist, duration, elevation);
    }

    //add workout object in array
    this.workouts.push(workout);

    //render workout on marker
    this._renderWorkoutMarker(workout);
    // console.log(this.workouts);

    //render workout in list
    this._renderWorkout(workout);

    //clear input fields
    this._hideForm();
  }

  _renderWorkoutMarker(workout) {
    this._setDescription(workout);

    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 50,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(workout.popupContent)
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
            <h2 class="workout__title">${workout.popupContent}</h2>
            <div class="workout__details">
                <span class="workout__icon">${
                  workout.type === 'running' ? `🏃‍♂️` : `🚴‍♀️`
                }</span>
                <span class="workout__value">${workout.distance}</span>
                <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⏱</span>
                <span class="workout__value">${workout.duration}</span>
                <span class="workout__unit">min</span>
            </div>
    `;
    if (workout.type === 'running')
      html += `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.pace.toFixed(1)}</span>
                <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.cadence}</span>
                <span class="workout__unit">spm</span>
            </div>
        </li>
      `;
    else
      html += `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.speed.toFixed(1)}</span>
                <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⛰</span>
                <span class="workout__value">${workout.elevation}</span>
                <span class="workout__unit">m</span>
            </div>
        </li>
      `;
    form.insertAdjacentHTML('afterend', html);
  }

  _setDescription(workout) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    let type =
      `${workout.type}`.charAt(0).toUpperCase() + `${workout.type}`.slice(1);
    if (type === `Running`) type = `🏃‍♂️ ` + type;
    else type = `🚴‍♀️ ` + type;
    const popupContent = `${type} on  ${
      months[workout.date.getMonth()]
    } ${workout.date.getDate()}`;

    workout.popupContent = popupContent;
  }

  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        ``;
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _moveToPoppup(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;
    const workout = this.workouts.find(el => el.id === workoutEl.dataset.id);
    this.#map.setView(workout.coords, this.#mapZoomLev, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    workout.click();
  }

}

const app = new App();
