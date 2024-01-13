<template>
    <div class="container">
        <div class="d-flex justify-content-between m-3">
            <h3>Filmy wg obsady</h3>

            <input type="button" @click=toggleSortDirection() class="btn btn-success col-sm-2" value="Zmien sortowanie" />
        </div>
        <ul class="list-group" v-for="(actor, index) in actors" v-bind:key="`actor-${index}`">
            <li class="list-group-item list-group-item-info" v-text="actor"></li>
            <ul v-for="(movie, index) in moviesForActor(actor)" v-bind:key="`movie-${index}`">
                <li class="list-group-item list-group-item-secondary" v-text="movie.title"></li>
            </ul>
        </ul>
    </div>
</template>

<script>
import { forEach, contains, uniq, last, sortBy } from 'underscore';

export default {
    name: "MoviesByCast",
    data() {
        return {
            myJson: {},
            moviesToDisplay: [],
            actors: []
        }
    },
    beforeCreate() {
        this.emitter.on('myJsonFromTable', myJsonFromTable => {
            this.myJson = myJsonFromTable
        });
    },
    methods: {

        toggleSortDirection() {
            this.actors = this.actors.reverse();
            this.moviesToDisplay = this.moviesToDisplay.reverse();
        },

        takeActors: function () {
            let tmp = []

            forEach(this.moviesToDisplay, (movie) => {
                forEach(movie.cast, (actor) => {
                    tmp.push(actor)
                })
            })
            this.actors = sortBy(uniq(tmp));
        },


        moviesForActor: function (actor) {
            let tableForActor = []

            forEach(this.moviesToDisplay, (movie) => {
                if (contains(movie.cast, actor) === true) {
                    tableForActor.push(movie)
                }
            })
            return tableForActor;
        }
    },
    mounted() {
        this.moviesToDisplay = last(this.myJson, 100);
        this.moviesToDisplay = sortBy(this.moviesToDisplay.map(movie => ({ ...movie })), 'title');
        this.takeActors()
    }
}
</script>

<style scoped>
.list-group-item {
    width: 40%;
}
</style>