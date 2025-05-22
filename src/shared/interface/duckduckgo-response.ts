export interface DuckDuckGoResponse {
  Abstract: string;
  AbstractSource: string;
  AbstractText: string;
  AbstractURL: string;
  Answer: string;
  AnswerType: string;
  Definition: string;
  DefinitionSource: string;
  DefinitionURL: string;
  Entity: string;
  Heading: string;
  Image: string;
  ImageHeight: number;
  ImageIsLogo: number;
  ImageWidth: number;
  Infobox: string;
  Redirect: string;
  RelatedTopics: RelatedTopic[];
  Results: any[];
  Type: string;
  meta: Meta;
}

export interface RelatedTopic {
  FirstURL?: string;
  Icon?: Icon;
  Result?: string;
  Text?: string;
  Name?: string;
  Topics?: Topic[];
}

export interface Icon {
  Height: string;
  URL: string;
  Width: string;
}

export interface Topic {
  FirstURL: string;
  Icon: Icon2;
  Result: string;
  Text: string;
}

export interface Icon2 {
  Height: any;
  URL: string;
  Width: any;
}

export interface Meta {
  attribution: any;
  blockgroup: any;
  created_date: any;
  description: string;
  designer: any;
  dev_date: any;
  dev_milestone: string;
  developer: Developer[];
  example_query: string;
  id: string;
  is_stackexchange: any;
  js_callback_name: string;
  live_date: any;
  maintainer: Maintainer;
  name: string;
  perl_module: string;
  producer: any;
  production_state: string;
  repo: string;
  signal_from: string;
  src_domain: string;
  src_id: number;
  src_name: string;
  src_options: SrcOptions;
  src_url: any;
  status: string;
  tab: string;
  topic: string[];
  unsafe: number;
}

export interface Developer {
  name: string;
  type: string;
  url: string;
}

export interface Maintainer {
  github: string;
}

export interface SrcOptions {
  directory: string;
  is_fanon: number;
  is_mediawiki: number;
  is_wikipedia: number;
  language: string;
  min_abstract_length: string;
  skip_abstract: number;
  skip_abstract_paren: number;
  skip_end: string;
  skip_icon: number;
  skip_image_name: number;
  skip_qr: string;
  source_skip: string;
  src_info: string;
}
