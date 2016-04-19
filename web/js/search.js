(function($) {
  var searchUrl = 'http://192.168.99.100:8983/solr/amd/select';
  var activeFacets = [];
  
  $.ajaxSettings.traditional = true;

  // Query Solr.
  var querySolr = function querySolr(searchQuery) {
    searchQuery = (searchQuery ? searchQuery : '*:*');
    activeFacets = $('input:checkbox:checked', '#facets').map(function() {
      return this.value;
    }).get();

    var data = {
      'wt':'json',
      'facet': 'true',
      'facet.field': ['manufacturer_s', 'cat'],
      'facet.range': 'price',
      'f.price.facet.range.start': 0,
      'f.price.facet.range.end': 600,
      'f.price.facet.range.gap': 50, 
      'facet.range.other':'after',
      'q': searchQuery,
      'fq': activeFacets
    };

    $.ajax({
      url: searchUrl,
      success: parseResults,
      data: data,
      dataType: 'jsonp',
      jsonp: 'json.wrf'
    });
  };

  // Retrieve facets from solr.
  var parseResults = function parseFacets(data) {
    var facetsQuery = data.responseHeader.params.fq;
    var facets = [];
    $.each(data.facet_counts.facet_fields, function( facetName, options ) {
      var facetOpts = [];
      var i = 0;
      while (i < options.length) {
        var facetValue = facetName + ':' + options[i];
        facetOpts.push('<li><input type="checkbox" id="' + facetName + '-' + options[i] + '" ' +
                    'value="' + facetValue + '" ' + (facetsQuery && facetsQuery.indexOf(facetValue) !== -1 ? 'checked' : '') + '> ' +
                    '<label for="' + facetName + '-' + options[i] +'">' +
                    options[i] + ' (' + options[i + 1] + ')</label></li>');
        i += 2;
      }

      // Append Facet groups.
      facets.push($('<h2/>', { html: facetName }));
      facets.push($('<ul/>', { html: facetOpts.join('') }));
    });
    $('#facets').html(facets);

    // Append results.
    var results = [];
    $.each(data.response.docs, function(index, result) {
      results.push('<div><h3>' + result.name_s + '</h3>' +
                    '<p>Manufacturer: ' + result.manufacturer_s + '</p>' +
                    '<p>Category: ' + result.cat.join(', ') + '</p>' +
                    '<p>Price: $' + result.price_f + '</p>' +
                    '</div>');
    });
    $('#results-list').html(results);

    // Update results title count.
    $('#resultsTitle').html('<h2>Results (' + data.response.numFound + ')</h2>');
  };

  // Query Solr for initial facets and results.
  querySolr('*:*');

  $(document).ready(function() {
    $('#searchSubmit').click(function() {
      querySolr($('#searchInput').val());
    });

    $('#facets').on('change', 'input:checkbox', function() {
      querySolr($('#searchInput').val());
    });
  });
})(jQuery);