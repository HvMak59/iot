import { User } from 'src/user/entities/user.entity';
import { AssetTypeListAttribs } from './assetTypeAttribsList';
// import { RelatedOrg } from './related-org.dto';

export class UserWithRelatedOrgs extends User {
  constructor(user: Partial<User>) {
    super(user);
    Object.assign(this, user);
  }
  // relatedOrgs: RelatedOrg[] = [];
  //assetTypeListAttribs: AssetTypeListAttribs;
}
