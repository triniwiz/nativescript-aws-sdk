import { Observable } from 'tns-core-modules/data/observable';

export class HelloWorldModel extends Observable {
  public message: string;
  public downloadProgress = 0;
  public uploadProgress = 0;
  public uploadCompleted = false;
  public imageDownload = '';
  constructor() {
    super();
  }
}
