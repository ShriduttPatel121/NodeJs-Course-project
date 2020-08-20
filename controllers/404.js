exports.getError404Page = (req, res, next) => {
  res
    .status(404)
    .render("404", {
      pageTitle: "Page not found404",
      path: "/notfound",
      isAuthenticated: req.session.isAuthenticated,
    });
};

exports.getError500Page = (req, res, next) => {
    res
      .status(500)
      .render("500", {
        pageTitle: "Page not found500",
        path: "/notfound",
        isAuthenticated: req.session.isAuthenticated,
      });
  };
  
