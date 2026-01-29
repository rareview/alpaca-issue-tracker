import { marked } from 'marked';
import './About.scss';
// eslint-disable-next-line import/no-unresolved
import aboutMarkdown from 'bundle-text:./About.md';

const About = () => {
  return (
    <div
      className="alpaca-about-page-content"
      dangerouslySetInnerHTML={{ __html: marked(aboutMarkdown) }}
    />
  );
};

export default About;
