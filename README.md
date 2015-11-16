# Fnord-O-Meter 
###### A meme-splice of Robert Anton Wilson, Lloyd DeMausse, and Issac Asimov

##### What

This project will create a Nametag app to find [group fantasy words](http://books.google.com/books?id=V8Sas74bBjwC&pg=PA134&lpg=PA134&dq=%22group-fantasy+analysis%22&source=bl&ots=M5eM12T_E0&sig=CZRnfzxmtT9sahP67ZJCXGExPYo&hl=en&sa=X&ei=iZ45VNDMLoWfyQSpioDwBg&ved=0CDUQ6AEwBA#v=onepage&q=%22group-fantasy%20analysis%22&f=false) in text.


##### Why

* An example of group fantasy analysis that makes it easy to grasp
* A demonstration of how to write a useful application in Nametag Templates
* A tool for empirically testing GF theory
* Predicting the political future
* Seeing the fnords!

##### When

The #memes channel on DALnet was once a hotbed of bizzare ideas.  One we actually followed through was the Fnord-O-Meter, specced by channel users and written by yegs.  The date on 5th-gen copy of the original html app is dated 1/5/07. 

A second version of the Fnord-O-Meter was under development in 2012.  This was a Jtag-based web app; Jatag being the precursor of Nametag Templates.  This code has been found and placed in the git history. There was no version control so incremental progress is saved as numberd files.

In 2014 the project was ressurected and is currently being refactored into a Nametag Templates web application.

##### Planned Features
* Simple sequential display
* Sequential display with proximal nouns 
* Frequency ordered display
* Scratchpad persistence using localStorage
* Expand fnord word library, and categorize based on fetal drama phases [strong,constrictive,cracking,upheaval]
* D3 Trend graphing from results files

##### Big Dream Features
* Results files using TrustFS
* Categories and other metadata on results files
* AJAXy url-based page parsing
* Pages fetched and parsed automatically, periodically, based on a pref file
* Multi-language support

##### Development Path
* Refactor old code into cell-based list output
* Inspector pattern with tabbed inspector panes
* pane 1 = {title, description, text} populaing fields and textarea
* pane 2 = fnord word list with feq count
* pane 3 = proximal noun/adj display
* pane 4 = d3 histogram
* Ajaxy request for sample data, saving user data to localstorage