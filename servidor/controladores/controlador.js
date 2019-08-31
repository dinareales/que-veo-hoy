var conexionBaseDeDatos = require('../lib/conexionbd');
var fs  = require("fs");

function mostrarPeliculas(req, res) {
  // Guardamos los parametros enviados en la busqueda
  var anio = req.query.anio;
  var titulo = req.query.titulo;
  var genero = req.query.genero;
  var columna_orden = req.query.columna_orden;
  var tipo_orden = req.query.tipo_orden;
  var pagina = req.query.pagina;
  var cantidad = req.query.cantidad;

  // Modularizamos las queries
  var sqlInicial = leerSql("mostrarPeliculas.sql");
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

  conexionBaseDeDatos.query(sqlTotalResultados, function(error, resultado, campos) {
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

  conexionBaseDeDatos.query(sql, function(error, resultado, campos) {
    console.log(sql);
    if(error) {
      console.log('Hubo un error en la consulta', error.message);
      return res.status(404).send('Hubo un error en la consulta');
    }  
    respuesta.peliculas = resultado;
    res.send(JSON.stringify(respuesta));
  });
};

function obtenerGeneros(req, res){
  var peticionSql = 'SELECT * FROM genero';
  conexionBaseDeDatos.query(peticionSql, function(error,resultado, campos){
    if (error) {
      console.log('Hubo un error en la consulta', error.message);
      return res.status(404).send('Hubo un error en la consulta');
    }
    var respuesta = {
      'generos' : resultado
    };
    res.send(JSON.stringify(respuesta));
  });
}

function informacionPeliculas(req, res){
  var id = req.params.id;

  //se crea la query que devuelve los actores de las pelicula seleccionada
  var peticionSql = leerSql("informacionPeliculas.sql")  + id ;
  conexionBaseDeDatos.query(peticionSql, function(error,resultado, campos){
    if (error) {
      console.log('Hubo un error en la consulta', error.message);
      return res.status(404).send('Hubo un error en la consulta');
    }
    var respuesta = {
      'pelicula' : resultado[0],
      'genero' : resultado[0].genero_nombre,
      'actores' : resultado.map(actor => actor),
    };
    res.send(JSON.stringify(respuesta));
  });
}

function recomendarPeliculas(req,res){
  //guardamos los parametros
  var genero = req.query.genero;
  var anio_inicio = req.query.anio_inicio;
  var anio_fin = req.query.anio_fin;
  var puntuacion = req.query.puntuacion;

  //verificamos los parametros enviados para los filtros de recomendacion
  var peticionSql = function (){
    var query= leerSql('recomendarPeliculas.sql');

    if(genero || anio_inicio || anio_fin || puntuacion) {
      query += ' WHERE ';
      if(genero) {
        query += 'genero.nombre = "' + genero + '"';
        if(anio_inicio || anio_fin || puntuacion) {
          query += ' AND ';
        }
      }
      if(anio_inicio || anio_fin) {
        query += 'pelicula.anio BETWEEN ' + anio_inicio + ' AND ' + anio_fin;
        if(puntuacion) {
          query += ' AND ';
        }
      }
      if(puntuacion) {
        query += 'pelicula.puntuacion = ' + puntuacion;
      }
    }
    return query;
  }
  conexionBaseDeDatos.query(peticionSql(), function(error,resultado, campos){
    if (error) {
      console.log('Hubo un error en la consulta', error.message);
      return res.status(404).send('Hubo un error en la consulta');
    }
    var respuesta = {
      'peliculas' : resultado
    };
    res.send(JSON.stringify(respuesta));
  });
}

/**
 funcion que permite leer  el contenido de una archivo
  @archivo :: nombre del archivo
  @carpeta :: paranetro opcional del nombre de la carpeta donde se encuentra  el archivo
*/
function leerSql(archivo, carpeta = "sql/") {
   var query = fs.readFileSync(carpeta + archivo).toString()
    .replace(/(\r\n|\n|\r)/gm," ") // remove newlines
    .replace(/\s+/g, ' ') // excess white space
    .split(";") // split into all statements
    .map(Function.prototype.call, String.prototype.trim)
    .filter(function(el) {return el.length != 0}); // remove any empty ones
  return query;
}

module.exports = {
  mostrarPeliculas : mostrarPeliculas,
  obtenerGeneros: obtenerGeneros,
  informacionPeliculas : informacionPeliculas,
  recomendarPeliculas : recomendarPeliculas,
};