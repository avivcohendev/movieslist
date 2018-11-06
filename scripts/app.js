class Popup extends React.Component {
  render() {
    return (
      <div className="popup">
        <div className={`popup-container ${this.props.type ? this.props.type : ''}`}>
          <div className="popup-content">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      showForm: false,
      isEdit: 0,
      isDelete: 0,
      defaultInput: {
        id: "",
        Title: "",
        Year: "",
        Runtime: "",
        Genre: "",
        Director: "",
        Poster: ""
      },
      validation: {
        id: "",
        Title: "",
        Year: "",
        Runtime: "",
        Genre: "",
        Director: ""
      },
      movies: []
    }
  }

  componentDidMount() {
    this.updateMoviesList();
  }

  render() {
    return (
      <div>
          <AppHeader />

          <div className="main_page">
              <MoviesList
                movies={this.state.movies}
                handleDeleteMovie={this.handleDeleteMovie}
                handleEditMovie={this.handleEditMovie} />

              <MoviesListAddButton
                handleShowForm={this.handleShowForm} />

              { this.state.showForm ? <MoviesListForm
                movies={this.state.movies}
                isEdit={this.state.isEdit}
                validation={this.state.validation}
                handleErrors={this.handleErrors}
                defaultInput={this.state.defaultInput}
                addNewMovie={this.addNewMovie}
                editNewMovie={this.editNewMovie}
                handleHideForm={this.handleHideForm} /> : null }

      { this.state.isDelete > 0 ? <MoviesListDelete
                deleteNewMovie={this.deleteNewMovie}
                handleHideFormDelete={this.handleHideFormDelete}
                isDelete={this.state.isDelete} /> : null }
          </div>

            <AppFooter />
      </div>
    );
  }

  updateMoviesList = () => {
    let moviesImport = [];
    const moviesNames = ["The+Shawshank+Redemption",
        "The+Matrix",
        "Fight+Club",
        "The+Lion+King"];
    const api = 'https://www.omdbapi.com/?apikey=158f4e2e&t=';
    const apiCall = (i) => {
        return fetch(api+'&t='+moviesNames[i]).then(res => res.json());
    }
      
    const apiDataImport = async () => {
      try {

        let moviesDataArr = {};
          for(let i = 0; i < moviesNames.length; i++){
        var moviesDataArr = {id: i+1}

            let data = await apiCall(i);
          Object.entries(data).map(([key,val]) => {
            if(key in this.state.defaultInput){
              moviesDataArr[key] = val;
            }
          });

            moviesImport.push(moviesDataArr);
          }

          this.setState({movies: moviesImport});
      } catch(err) { 
          console.log(err);       
      }
    }
    apiDataImport();
  }

  addNewMovie = (formData) => {
    var moviesLength = this.state.movies.length;
    
    formData['id'] = this.state.movies[moviesLength-1]['id'] + 1;
    this.setState({movies: this.state.movies.concat(formData)});
    this.handleHideForm();
  }

  editNewMovie = (movie) => {
    movie.id = this.state.isEdit;
    let movies = this.state.movies;

    for(var i = 0; i < movies.length; i++){
      if(movies[i].id == movie.id){
        Object.keys(movies[i]).map((key) => {
          movies[i][key] = movie[key];
        });
      }
    }

    this.setState({movies: movies});
    this.handleHideForm();
  }

  deleteNewMovie = (movie) => {
    let movies = this.state.movies;
    for(var i = 0; i < movies.length; i++){
      if(movies[i].id == movie){
        movies.splice(i, 1);
      }
    }

    this.setState({movies: movies});
  }

  handleShowForm = () => {
    this.setState({showForm: true});
  }

  handleHideForm = () => {
    if(this.state.isEdit > 0){
      let restoreDefaultInput = {};
      Object.keys(this.state.defaultInput).map((key) => {
        restoreDefaultInput[key] = '';
      });
      this.setState({showForm: false, isEdit: 0, defaultInput: restoreDefaultInput});
    }else{
      this.setState({showForm: false});
    }
  }

  handleHideFormDelete = () => {
    this.setState({isDelete: 0});
  }

  handleDeleteMovie = (movie) => {
    this.setState({isDelete: movie.id});
  }

  handleEditMovie = (movie) => {
    this.setState({isEdit: movie.id, defaultInput: movie});
    this.handleShowForm();
  }

  handleErrors = (error) => {
    return error.length === 0 ? '' : 'has-error';
  }
}

class MoviesList extends React.Component {
  render() {
    let movies = this.props.movies.map((movie) => {
      return (
        <li className="movie" key={movie.id}>
          <div className="movie_image"><img src={movie.Poster ? movie.Poster : 'imgs/placeholder.jpg'} /></div>
          <div className="movie_content">
            <h2>{movie.Title}</h2>
            <span className="delete" onClick={this.onDelete.bind(this,movie)}><span>delete</span></span>
            <span className="edit" onClick={this.onEdit.bind(this,movie)}><span>edit</span></span>
            <ul className="movie_info">
              <li>Year: <span>{movie.Year}</span></li>
              <li>Runtime: <span>{movie.Runtime}</span></li>
              <li>Genre: <span>{movie.Genre}</span></li>
              <li>Director: <span>{movie.Director}</span></li>
            </ul>
          </div>
        </li>
      )
    });

    return (
      <ul className="movies list-group">
        {movies}
      </ul>
    );
  }

  onDelete = (movie) => {
    this.props.handleDeleteMovie(movie);
  }

  onEdit = (movie) => {
    this.props.handleEditMovie(movie);
  }
}

class MoviesListDelete extends React.Component {
  render() {
    return (
      <div>
        <Popup type="small">
          <form onSubmit={this.onSubmit}>
            <div className="form-group">
              Are you sure you want to delete this movie?
            </div>
            <div className="form-group">
              <input type="submit" className="btn btn-success" value="Delete" />
              <input type="button" className="btn btn-danger" value="Cancel" onClick={this.onCancel} />
            </div>
          </form>
        </Popup>
      </div>
    );
  }

  onSubmit = (e) => {
    e.preventDefault();
    if(this.props.isDelete > 0){
      this.props.deleteNewMovie(this.props.isDelete);
    }
    this.props.handleHideFormDelete();
  }

  onCancel = () => {
    this.props.handleHideFormDelete();
  }
}

class MoviesListForm extends React.Component {
  render() {
    let inputForm = Object.entries(this.props.defaultInput).map(([key,val]) => {
      if(key != 'id' && key != 'Poster'){
        return (
          <div className={`form-group ${this.props.handleErrors(this.props.validation[key])}`} key={key}>
            <label>{key}</label>
            <input type="text" name={key} defaultValue={val} className="form-control" />
            <span className="help-block text-danger">{this.props.validation[key]}</span>
          </div>
        )
      }
    });

    return (
      <div>
        <Popup>
          <form onSubmit={this.onSubmit}>
            {inputForm}
            <div className="form-group">
              <input type="submit" className="btn btn-success" value="Save" />
              <input type="button" className="btn btn-danger" value="Cancel" onClick={this.onCancel} />
            </div>
          </form>
        </Popup>
      </div>
    );
  }

  onSubmit = (e) => {
    e.preventDefault();
    let moviesList = this.props.movies;

    let validateForm = true, formData = {}, self = this, errorText;
    Object.values(e.target).map((val) => {
      errorText = '';
      if(val.value != ''){
        if(val.name == 'Year' && isNaN(val.value)){
          errorText = 'This field can only contain numeric values';
        }else if(val.name == 'Title'){
          moviesList.forEach(function(elm){
            if(elm['id'] != self.props.isEdit && elm['Title'] == val.value){
              errorText = 'This movie already exists';
            }
          });
          val.value = val.value.replace(/[^a-z0-9\s]/gi,'').replace(/\b\w/g, l => l.toUpperCase());
        }

        if(val.name && errorText == ''){
          formData[val.name] = val.value;
        }
      }else{
        errorText = 'This field cannot be blank';
      }

      if(errorText){
        validateForm = false;
      }

      this.props.validation[val.name] = errorText;
    });
    this.setState({validation: this.props.validation});

    if(validateForm){
    fetch('https://www.omdbapi.com/?apikey=158f4e2e&t='+formData['Title'])
    .then(results => {
    	return results.json();
    }).then(data => {
    	console.log(data);
    	if(data['Poster']){
    		formData['Poster'] = data['Poster'];
    	}

      	if(this.props.isEdit > 0){
		    this.props.editNewMovie(formData);
	    }else{
	        this.props.addNewMovie(formData);
	    }
    });
    }
  }

  onCancel = () => {
    this.props.handleHideForm();
  }
}

class MoviesListAddButton extends React.Component {
  render() {
    return (
      <div className="movies_btn">
        <input type="button" className="btn btn-primary" value="Add New Movie" onClick={this.onClick} />
      </div>
    );
  }

  onClick = () => {
    this.props.handleShowForm();
  }
}

class AppHeader extends React.Component {
  render() {
    return (
    <header className="header">
        <h1>Herolo Movies List Task</h1>
    </header>
    );
  }
}

class AppFooter extends React.Component {
  render() {
    return (
    <footer className="footer">
      <p className="align-left">© 2017 Aviv Cohen</p>
    </footer>
    );
  }
}
  
ReactDOM.render(<App />, document.getElementById('app'));