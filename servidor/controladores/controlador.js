var conexion = require('../lib/conexionbd');

function mostrarPeliculas(req, res) {
  // Guardamos los parametros enviados en la busqueda
  var pagina = req.query.pagina;
  var titulo = req.query.titulo;
  var genero = req.query.genero;
  var anio = req.query.anio;
  var cantidad = req.query.cantidad;
  var columna_orden = req.query.columna_orden;
  var tipo_orden = req.query.tipo_orden;

  // Modularizamos las queries
  var sqlInicial = `SELECT pelicula.id,
                           pelicula.poster,
                           pelicula.trama,
                           pelicula.titulo
                      FROM pelicula`;

  var sqlTitulo = 'titulo LIKE "%' + titulo + '%"';
  var sqlGenero = 'genero_id = "' + genero + '"';
  var sqlAnio = 'anio = ' + anio;

  // Verificamos los parametros enviados y armamos los filtros para la query
  var sqlFiltros = '';

  if(titulo || genero || anio) {
    sqlFiltros += ' WHERE ';
    if(titulo) {
      sqlFiltros += sqlTitulo;
      if(genero || anio) {
        sqlFiltros += ' AND ';
      }
    }
    if(genero) {
      sqlFiltros += sqlGenero;
      if(anio) {
        sqlFiltros += ' AND ';
      }
    }
    if(anio) {
      sqlFiltros += sqlAnio;
    }
  }

  // Definimos el objeto respuesta que se enviará al frontend
  var respuesta = {
    'peliculas': null,
    'total': null
  };

  // Creamos la query que calcula el total de peliculas encontradas aplicando los filtros
  var sqlTotalResultados = sqlInicial + sqlFiltros;

  conexion.query(sqlTotalResultados, function(error, resultado, campos) {
    if(error) {
      console.log('Hubo un error en la consulta', error.message);
      return res.status(404).send('Hubo un error en la consulta');
    }
    respuesta.total = resultado.length;
  });

  // Lógica para crear la paginacion segun los parametros enviados
  var paginacion = function(pagina, cantidad) {
    return ' LIMIT ' + ((pagina - 1) * 52) + ',' + cantidad;
  }  

  // Creamos la query que devuelve las peliculas encontradas, ordenadas y paginadas
  var sql= sqlTotalResultados + ' ORDER BY ' + columna_orden + ' ' + tipo_orden + paginacion(pagina, cantidad);

  conexion.query(sql, function(error, resultado, campos) {
    console.log(sql);
    if(error) {
      console.log('Hubo un error en la consulta', error.message);
      return res.status(404).send('Hubo un error en la consulta');
    }  
    respuesta.peliculas = resultado;
    res.send(JSON.stringify(respuesta));
  });
};

module.exports = {
  mostrarPeliculas : mostrarPeliculas,
};