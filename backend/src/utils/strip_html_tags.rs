use html5ever::tendril::TendrilSink;
use html5ever::{parse_document, ParseOpts};
use markup5ever_rcdom::{Node, NodeData, RcDom};

pub fn strip_html_tags(input: &str) -> String {
    let dom = parse_document(RcDom::default(), ParseOpts::default())
        .from_utf8()
        .one(input.as_bytes());
    let doc = dom.document;
    get_text(&doc).into_iter().collect::<Vec<String>>().join("")
}

/// Helper function to return text in text nodes in pre-order traversal.
fn get_text(element: &Node) -> Vec<String> {
    match element.data {
        NodeData::Text { ref contents } => {
            let mut text = vec![(&**contents.borrow()).to_owned()];
            for child in &*element.children.borrow() {
                text.append(&mut get_text(child));
            }
            text
        }
        _ => {
            let mut text = vec![];
            for child in &*element.children.borrow() {
                text.append(&mut get_text(child));
            }
            text
        }
    }
}
