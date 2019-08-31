SELECT pelicula.id,
	pelicula.poster,
	pelicula.trama,
	pelicula.titulo,
    genero.nombre
FROM pelicula 
JOIN genero ON genero.id = pelicula.genero_id