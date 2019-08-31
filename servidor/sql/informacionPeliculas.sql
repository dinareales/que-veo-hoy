SELECT pelicula.poster,
                    pelicula.titulo,
                    pelicula.anio,
                    pelicula.trama,
                    pelicula.fecha_lanzamiento,
                    pelicula.director,
                    pelicula.duracion,
                    pelicula.puntuacion,
                    actor.nombre,
                    genero.nombre AS genero_nombre
               FROM pelicula
               JOIN actor_pelicula ON pelicula.id = actor_pelicula.pelicula_id
               JOIN actor ON actor.id = actor_pelicula.actor_id
               JOIN genero ON genero.id = pelicula.genero_id
              WHERE pelicula.id = 