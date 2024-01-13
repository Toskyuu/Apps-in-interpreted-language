<template>
    <div class="container">
        <div class="d-flex justify-content-between m-3">
            <h3>Filmy wg gatunku</h3>

            <input type="button" @click=toggleSortDirection() class="btn btn-success col-sm-2" value="Zmien sortowanie" />
        </div>
        <ul class="list-group" v-for="(category, index) in categories" v-bind:key="`category-${index}`">
            <li class="list-group-item list-group-item-success" v-text="category"></li>
            <ul v-for="(movie, index) in moviesForCategory(category)" v-bind:key="`movie-${index}`">
                <li class="list-group-item list-group-item-secondary" v-text="movie.title"></li>
            </ul>
        </ul>
    </div>
</template>

<script>
import { forEach, contains, uniq, last, sortBy } from 'underscore';


export default {
    name: "MoviesListByGenre",

    data() {
        return {
            myJson: {},
            moviesToDisplay: [],
            categories: []
        }
    },

    beforeCreate() {
        this.emitter.on('myJsonFromTable', myJsonFromTable => {
            this.myJson = myJsonFromTable
        });
    },


    methods: {

        toggleSortDirection() {
            this.categories = this.categories.reverse();
            this.moviesToDisplay = this.moviesToDisplay.reverse();
        },

        takeCategories: function () {
            let tmp = []
            
            forEach(this.moviesToDisplay, (movie) => {
                forEach(movie.genres, (genre) => {
                    tmp.push(genre)
                })
            })
            this.categories = sortBy(uniq(tmp));
        },

        moviesForCategory: function (category) {
            let tableForCategory = []

            forEach(this.moviesToDisplay, (movie) => {
                if (contains(movie.genres, category) === true) {
                    tableForCategory.push(movie)
                }
            })
            return tableForCategory;
        }
    },

    mounted() {
        this.moviesToDisplay = last(this.myJson, 100);
        this.moviesToDisplay = sortBy(this.moviesToDisplay.map(movie => ({ ...movie })), 'title');
        this.takeCategories()
    }
}
</script>

<style scoped>
.list-group-item {
    width: 30%;
}
</style>