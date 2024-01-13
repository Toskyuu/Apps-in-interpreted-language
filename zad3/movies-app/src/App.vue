<template>
  <div id="app">
    <div class="container">
    <SearchEngine />
    <TableWithMovies></TableWithMovies>
    <MoviesListByGenre />
    <MoviesListByCast />
  </div>
  </div>
</template>

<script>



import SearchEngine from "@/components/SearchEngine";
import MoviesListByCast from "@/components/MoviesListByCast";
import MoviesListByGenre from "@/components/MoviesListByGenre";
import TableWithMovies from "@/components/TableWithMovies";


export default {
  name: 'app',
  components: {
    TableWithMovies,
    SearchEngine,
    MoviesListByCast,
    MoviesListByGenre,
  }
}
</script>

<style>
.container {
    max-width: 1140px;
}</style>
