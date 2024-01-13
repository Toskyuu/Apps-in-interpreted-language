<template>
    <div class="container">
        <table class="table-condensed table-hover">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Production Year</th>
                    <th>Cast</th>
                    <th>Genres</th>
                    <th>Showed movies: {{ moviesToDisplay.length }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(movieFromJS, index) in moviesToDisplay" v-bind:key="`movieFromJS-${index}`">
                    <td>{{ movieFromJS.title }}</td>
                    <td>{{ movieFromJS.year }}</td>
                    <td>{{ movieFromJS.cast.join(', ') }}</td>
                    <td>{{ movieFromJS.genres.join(', ') }}</td>
                </tr>
            </tbody>
        </table>
        <div class="form-group row">
            <input type="button" @click="displayNext10(moviesToDisplay, mySource)" class="btn btn-info col-sm-12"
                value="Pokaz wiecej" />
        </div>
    </div>
</template>
 
<script>
import json from '../assets/movies.json'
import { size } from 'underscore';

export default {
    name: "tableWithMovies",
    data() {
        return {
            mySource: json,
            moviesToDisplay: [],
            loadedFilteredMovies: [],
        }
    },
    created() {
        this.emitter.on('FilteredTable', FilteredTable => {
            this.moviesToDisplay = [];
            this.loadedFilteredMovies = [];
            this.initDisplay(this.loadedFilteredMovies, FilteredTable)
            this.moviesToDisplay = this.loadedFilteredMovies
        });
        this.emitter.on('Movie not found', msg => {
            alert(msg)
        });
    },
    methods: {
        displayNext10: function (currentList, source) {
            let maxIter = size(source)
            let iter = size(currentList);
            for (let i = iter; i < iter + 10; i++) {
                if (i < maxIter) currentList.push(source[i])
            }
        },
        initDisplay: function (currentList, source) {
            let lengthOfSource = 10;
            if (size(source) < 10) {
                lengthOfSource = size(source)
            }
            for (let i = 0; i < lengthOfSource; i++) {
                currentList.push(source[i])
                this.mySource = source
            }
        },
        shareJson: function () {
            this.emitter.emit('myJsonFromTable', this.mySource)
        },
    },
    beforeMount() {
        this.initDisplay(this.moviesToDisplay, this.mySource)
    },
    mounted() {
        this.shareJson()
    }


}
</script>
 
<style scoped></style>