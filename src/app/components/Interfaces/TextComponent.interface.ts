type ITextTypes = {
  paragraph?: string;
  subheading?: string;
  heading?: string;
};

export interface ITextComponent {
  text: string;
  type: string;
  gutterBottom?: boolean;
  customStyles?: string;
}
