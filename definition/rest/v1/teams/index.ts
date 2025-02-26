

import type { IRoom } from '../../../IRoom';
import type { ITeam } from '../../../ITeam';
import type { IUser } from '../../../IUser';
import { PaginatedResult } from '../../helpers/PaginatedResult';
import { PaginatedRequest } from '../../helpers/PaginatedRequest';
import { ITeamAutocompleteResult, ITeamMemberInfo } from '../../../../server/sdk/types/ITeamService';
import { TeamsRemoveRoomProps } from './TeamsRemoveRoomProps';
import { TeamsConvertToChannelProps } from './TeamsConvertToChannelProps';
import { TeamsUpdateMemberProps } from './TeamsUpdateMemberProps';
import { TeamsAddMembersProps } from './TeamsAddMembersProps';
import { TeamsRemoveMemberProps } from './TeamsRemoveMemberProps';
import { TeamsDeleteProps } from './TeamsDeleteProps';
import { TeamsLeaveProps } from './TeamsLeaveProps';
import { TeamsUpdateProps } from './TeamsUpdateProps';


type TeamProps =
	| TeamsRemoveRoomProps
	| TeamsConvertToChannelProps
	| TeamsUpdateMemberProps
	| TeamsAddMembersProps
	| TeamsRemoveMemberProps
	| TeamsDeleteProps
	| TeamsLeaveProps
	| TeamsUpdateProps;

export const isTeamPropsWithTeamName = <T extends TeamProps>(props: T): props is T & { teamName: string } => 'teamName' in props;

export const isTeamPropsWithTeamId = <T extends TeamProps>(props: T): props is T & { teamId: string } => 'teamId' in props;

export type TeamsEndpoints = {
	'teams.list': {
		GET: () => PaginatedResult & { teams: ITeam[] };
	};
	'teams.listAll': {
		GET: () => { teams: ITeam[] } & PaginatedResult;
	};
	'teams.create': {
		POST: (params: {
			name: ITeam['name'];
			type?: ITeam['type'];
			members?: IUser['_id'][];
			room: {
				id?: string;
				name?: IRoom['name'];
				members?: IUser['_id'][];
				readOnly?: boolean;
				extraData?: {
					teamId?: string;
					teamMain?: boolean;
				} & { [key: string]: string | boolean };
				options?: {
					nameValidationRegex?: string;
					creator: string;
					subscriptionExtra?: {
						open: boolean;
						ls: Date;
						prid: IRoom['_id'];
					};
				} & {
					[key: string]:
					| string
					| {
						open: boolean;
						ls: Date;
						prid: IRoom['_id'];
					};
				};
			};
			owner?: IUser['_id'];
		}) => {
			team: ITeam;
		};
	};

	'teams.convertToChannel': {
		POST: (params: TeamsConvertToChannelProps) => void;
	};

	'teams.addRooms': {
		POST: (params: { rooms: IRoom['_id'][]; teamId: string } | { rooms: IRoom['_id'][]; teamName: string }) => ({ rooms: IRoom[] });
	};

	'teams.removeRoom': {
		POST: (params: TeamsRemoveRoomProps) => ({ room: IRoom });
	};

	'teams.members': {
		GET: (params: ({ teamId: string } | { teamName: string }) & { status?: string[]; username?: string; name?: string }) => (PaginatedResult & { members: ITeamMemberInfo[] });
	};

	'teams.addMembers': {
		POST: (params: TeamsAddMembersProps) => void;
	};

	'teams.updateMember': {
		POST: (params: TeamsUpdateMemberProps) => void;
	};

	'teams.removeMember': {
		POST: (params: TeamsRemoveMemberProps) => void;
	};

	'teams.leave': {
		POST: (params: TeamsLeaveProps) => void;
	};


	'teams.info': {
		GET: (params: ({ teamId: string } | { teamName: string }) & {}) => ({ teamInfo: Partial<ITeam> });
	};

	'teams.autocomplete': {
		GET: (params: { name: string }) => ({ teams: ITeamAutocompleteResult[] });
	};

	'teams.update': {
		POST: (params: TeamsUpdateProps) => void;
	};

	'teams.delete': {
		POST: (params: TeamsDeleteProps) => void;
	};

	'teams.listRoomsOfUser': {
		GET: (params: {
			teamId: ITeam['_id'];
			userId: IUser['_id'];
			canUserDelete?: boolean;
		} | {
			teamName: ITeam['name'];
			userId: IUser['_id'];
			canUserDelete?: boolean;
		}
		) => PaginatedResult & { rooms: IRoom[] };
	};

	'teams.listRooms': {
		GET: (params: PaginatedRequest & ({ teamId: string } | { teamId: string }) & { filter?: string; type?: string }) => PaginatedResult & { rooms: IRoom[] };
	};


	'teams.updateRoom': {
		POST: (params: { roomId: IRoom['_id']; isDefault: boolean }) => ({ room: IRoom });
	};
};
