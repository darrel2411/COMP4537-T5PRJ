// Define the inclide function for absilute file name
global.base_dir = __dirname;
global.abs_path = function(path){
    return base_dir + path;
}
global.include = function(file) {
    return require( abs_path('/' + file) );
}