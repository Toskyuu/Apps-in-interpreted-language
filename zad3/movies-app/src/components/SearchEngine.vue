<template>
    <div class="container">
        <h2>Baza filmów</h2>
        <form>
            <div class="form-group">
                <label for="inputTitle">Tytuł</label>
                <input type="text" v-model="movie.title" id=inputTitle class="form-control"
                    placeholder="Podaj tytuł lub fragment tytułu filmu" />
            </div>
            <div class="form-group row">
                <label class="col-sm-4 col-form-label" for="inputProductionFrom">Rok produkcji od:</label>
                <div class="col-sm-8">
                    <input type="text" v-model="movie.yearFrom" id=inputProductionFrom class="form-control"
                        placeholder="Liczba naturalna z przedziału 1900-2023" />
                </div>
            </div>
            <div class="form-group row">
                <label class="col-sm-4 col-form-label" for="inputProductionTo">Rok produkcji do:</label>
                <div class="col-sm-8">
                    <input type="text" v-model="movie.yearTo" id=inputProductionTo class="form-control"
                        placeholder="Liczba naturalna z przedziału 1900-2023" />
                </div>
            </div>
            <div class="form-group">
                <label for="inputCast">Obsada</label>
                <input type="text" v-model="movie.cast" id="inputCast" class="form-control" placeholder="Imię i nazwisko" />
            </div>
            <div class="form-group row">
                <input type="button" @click="shareFilteredTable" class="btn btn-info col-sm-12" value="Szukaj" />
            </div>
        </form>
    </div>
</template>

<script>
import { forEach, size, isEqual } from 'underscore';
export default {
    name: "SearchEngine",
    data() {
        return {
            movie: {
                title: '',
                yearFrom: '',
                yearTo: '',
                cast: ''
            },
            myJson: {},
            moviesToSend: []
        }
    },
    created() {
        this.emitter.on('myJsonFromTable', myJsonFromTable => {
            this.myJson = myJsonFromTable
            this.moviesToSend = this.myJson
        });
    },
    methods: {
        findByTitle: function () {
            this.moviesToSend = [];
            forEach(this.myJson, (movie) => {
                if (movie.title.toLowerCase().includes(this.movie.title.toLowerCase())) {
                    this.moviesToSend.push(movie);

                }
            })

            let tmp = []
            if (this.movie.yearFrom !== undefined || this.movie.yearTo !== undefined) {
                tmp = this.moviesToSend
                this.moviesToSend = []
                if (isEqual(this.movie.yearTo, "")) this.movie.yearTo = 2023;
                if (isEqual(this.movie.yearFrom, "")) this.movie.yearFrom = 1900;

                forEach(tmp, (movie) => {
                    if (
                        parseInt(movie.year) >= parseInt(this.movie.yearFrom) &&
                        parseInt(movie.year) <= parseInt(this.movie.yearTo)
                    ) {
                        this.moviesToSend.push(movie)
                    }
                })
            }

            if (this.movie.cast !== "") {
                tmp = this.moviesToSend
                this.moviesToSend = []

                forEach(tmp, (movie) => {
                    forEach(movie.cast, (actor) => {
                        if (actor.toLowerCase().includes(this.movie.cast.toLowerCase())) {
                            this.moviesToSend.push(movie)
                        }
                    })
                })

            }


        },
        shareFilteredTable: function () {
            this.findByTitle();
            if (isEqual(size(this.moviesToSend), 0)) {
                this.emitter.emit('Movie not found', 'Nie znaleziono filmów');
                this.moviesToSend = this.myJson
            }
            else this.emitter.emit('FilteredTable', this.moviesToSend)
        }
    }
}
</script>

<style scoped>
.form-group {
    margin-bottom: 1rem;
}
</style>