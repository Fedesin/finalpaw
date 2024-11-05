var Roles = {
    list: function() {
        return fetch("/api/roles", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        })
        .then(response => response.json());
    }
}

var Users = {
    list: function(args) {
        params = new URLSearchParams(args);
        return fetch("/api/users" + ( params.size ? ('?' + params.toString()) : ''), {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        })
        .then(function(ret) {
            return ret.json();
        })
    },
    create: function(args) {
        return fetch("/api/users", {
            method: "POST",
            body: JSON.stringify(args),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json; charset=UTF-8"
            }
        })
        .then(function(ret) {
            return ret.json();
        })
    },
    update: function(args) {
        return fetch("/api/users", {
            method: "PUT",
            body: JSON.stringify(args),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json; charset=UTF-8"
            }
        })
        .then(function(ret) {
            return ret.json();
        })
    }
}

var Fases = {
    list: function(args) {
        params = new URLSearchParams(args);

        return fetch("/api/fases" + (params.size ? ('?' + params.toString()) : ''), {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        })
        .then(function(ret) {
            return ret.json();
        })
    },
    create: function(args) {
        return fetch("/api/fases", {
            method: "POST",
            body: JSON.stringify(args),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json; charset=UTF-8"
            }
        })
        .then(function(ret) {
            return ret.json();
        })
    },
    update: function(args) {
        return fetch("/api/fases", {
            method: "PUT",
            body: JSON.stringify(args),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json; charset=UTF-8"
            }
        })
        .then(function(ret) {
            return ret.json();
        })
    },
    delete: function(args) {
        return fetch("/api/fases", {
            method: "DELETE",
            body: JSON.stringify(args),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json; charset=UTF-8"
            }
        })
        .then(function(ret) {
            return ret.json();
        })
    },
    getAttributes: function(args) {
        params = new URLSearchParams(args);

        return fetch("/api/fases/atributos" + (params.size ? ('?' + params.toString()) : ''), {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        })
        .then(function(ret) {
            return ret.json();
        });
    },
    deleteCampo: function(args) {
        return fetch("/api/fases/deleteCampo", {
            method: "DELETE",
            body: JSON.stringify(args),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json; charset=UTF-8"
            }
        })
        .then(function(ret) {
            return ret.json();
        });
    }
}

var Productos = {
    list: function() {
        return fetch("/api/productos", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        })
        .then(response => response.json());
    },
    create: function(args) {
        // Cambiar la URL a "/api/productos" para que coincida con la ruta en el backend
        return fetch("/api/productos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(args)
        })
        .then(response => response.json());
    },
    update: function(args) {
        // Cambiar la URL a "/api/productos" para actualizar (usando el método PUT)
        return fetch("/api/productos", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(args)
        })
        .then(response => response.json());
    },
    delete: function(args) {
        // Cambiar la URL a "/api/productos" para eliminar (usando el método DELETE)
        return fetch("/api/productos", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(args)
        })
        .then(response => response.json());
    },
    tipos: function() {
        return fetch("/api/productos/tipo-productos", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        }).then(response => response.json());
    }
};

var Lotes = {
    create: function(args) {
        return fetch("/api/lotes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(args)
        }).then(response => response.json());
    },
    list: function() {
        return fetch("/api/lotes", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        })
        .then(response => response.json());
    }
};
