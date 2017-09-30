function codeToLink(string){
  var code = atob(string.replace(/#/g, "="));
  var stringCode = code.split("").reverse().join("");
  return ("https://teamtreehouse.com/library/" + stringCode + "&hd=yes");
}

function encodeLearn(string){
  return btoa(string.replace("https://teamtreehouse.com/library/", "").split("").map((item, idx, a) => {return a[(a.length-idx)-1]}).join("")).replace(/=/g, "#");
}

$("#learnButton").on("click", function(e){
  var link = codeToLink($("#codeInput").val());
  $.ajax({
    url: link,
    data: {},
    success: function(res){
      var xmlConvert = new X2JS();
      var xml = new XMLSerializer().serializeToString(res);
      var course = xmlConvert.xml_str2json(xml).rss.channel;
      $("#courseName").text(course.title.replace("Treehouse - ", ""));
      course.item.forEach(function(item, idx){
        $("#videos").append(`
          <div class="col-lg-3 col-md-4 col-sm-6 portfolio-item">
            <div class="card h-100">
              <a href="${item.enclosure._url}" target="_blank"><img class="card-img-top" src="http://placehold.it/700x400" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="${item.enclosure._url}" target="_blank">${idx+1}. ${item.title}</a>
                </h4>
                <p class="card-text">${item.description}</p>
              </div>
            </div>
          </div>
        `);
      });
    }
  });
});
