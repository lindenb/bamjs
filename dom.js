var Rhino= {
createDocument : function() {
  var dbf = javax.xml.parsers.DocumentBuilderFactory.newInstance();
  dbf.setNamespaceAware(true);
  var db = dbf.newDocumentBuilder();
  var document = db.newDocument();
  return document;
  },
dumpXml: function(node) {
  var transformer = javax.xml.transform.TransformerFactory.newInstance().newTransformer();
  transformer.transform(
	  new javax.xml.transform.dom.DOMSource(node),
	  new javax.xml.transform.stream.StreamResult(java.lang.System.out)
	  );
  }
}

  
