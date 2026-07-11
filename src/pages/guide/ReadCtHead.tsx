import { ImagingReadPage } from '../../components/imaging/ImagingReadPage';
import { CT_HEAD_MODULE } from '../../data/imaging/ctHead';

export default function ReadCtHead() {
  return <ImagingReadPage module={CT_HEAD_MODULE} />;
}
