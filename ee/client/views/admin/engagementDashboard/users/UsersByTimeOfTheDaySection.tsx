import { ResponsiveHeatMap } from '@nivo/heatmap';
import { Box, Flex, Select, Skeleton, ActionButton } from '@rocket.chat/fuselage';
import moment from 'moment';
import React, { ReactElement, useMemo } from 'react';

import { useTranslation } from '../../../../../../client/contexts/TranslationContext';
import { useEndpointData } from '../../../../../../client/hooks/useEndpointData';
import { downloadCsvAs } from '../../../../../../client/lib/download';
import Section from '../Section';
import { usePeriod } from '../usePeriod';

type UsersByTimeOfTheDaySectionProps = {
	timezone: 'utc' | 'local';
};

const UsersByTimeOfTheDaySection = ({
	timezone,
}: UsersByTimeOfTheDaySectionProps): ReactElement => {
	const utc = timezone === 'utc';

	const [period, periodSelectProps] = usePeriod({ utc });

	const t = useTranslation();

	const params = useMemo(
		() => ({
			start: period.start.toISOString(),
			end: period.end.toISOString(),
		}),
		[period],
	);

	const { value: data } = useEndpointData(
		'engagement-dashboard/users/users-by-time-of-the-day-in-a-week',
		useMemo(() => params, [params]),
	);

	const [dates, values] = useMemo(() => {
		if (!data) {
			return [];
		}

		const dates = Array.from(
			{
				length: utc
					? moment(period.end).diff(period.start, 'days') + 1
					: moment(period.end).diff(period.start, 'days') - 1,
			},
			(_, i) =>
				moment(period.start)
					.endOf('day')
					.add(utc ? i : i + 1, 'days'),
		);

		const values = Array.from(
			{ length: 24 },
			(_, hour) =>
				({
					hour: String(hour),
					...dates
						.map((date) => ({ [date.toISOString()]: 0 }))
						.reduce((obj, elem) => ({ ...obj, ...elem }), {}),
				} as { [date: string]: number } & { hour: string }),
		);

		const timezoneOffset = moment().utcOffset() / 60;

		for (const { users, hour, day, month, year } of data.week) {
			const date = utc
				? moment.utc([year, month - 1, day, hour])
				: moment([year, month - 1, day, hour]).add(timezoneOffset, 'hours');

			if (utc || (!date.isSame(period.end) && !date.clone().startOf('day').isSame(period.start))) {
				values[date.hour()][date.endOf('day').toISOString()] += users;
			}
		}

		return [dates.map((date) => date.toISOString()), values];
	}, [data, period.end, period.start, utc]);

	const downloadData = (): void => {
		const _data = [
			['Date', 'Users'],
			...(data?.week
				?.map(({ users, hour, day, month, year }) => ({
					date: moment([year, month - 1, day, hour, 0, 0, 0]),
					users,
				}))
				?.sort((a, b) => a.date.diff(b.date))
				?.map(({ date, users }) => [date.toISOString(), users]) ?? []),
		];
		downloadCsvAs(_data, `UsersByTimeOfTheDaySection_start_${params.start}_end_${params.end}`);
	};
	return (
		<Section
			title={t('Users_by_time_of_day')}
			filter={
				<>
					<Select {...periodSelectProps} />
					{
						<ActionButton
							small
							mis='x16'
							onClick={downloadData}
							aria-label={t('Download_Info')}
							icon='download'
						/>
					}
				</>
			}
		>
			{data ? (
				<Box display='flex' style={{ height: 696 }}>
					<Flex.Item align='stretch' grow={1} shrink={0}>
						<Box style={{ position: 'relative' }}>
							<Box
								style={{
									position: 'absolute',
									width: '100%',
									height: '100%',
								}}
							>
								<ResponsiveHeatMap
									data={values ?? []}
									indexBy='hour'
									keys={dates}
									padding={4}
									margin={{
										// TODO: Get it from theme
										left: 60,
										bottom: 20,
									}}
									colors={[
										// TODO: Get it from theme
										'#E8F2FF',
										'#D1EBFE',
										'#A4D3FE',
										'#76B7FC',
										'#549DF9',
										'#1D74F5',
										'#10529E',
									]}
									cellOpacity={1}
									enableLabels={false}
									axisTop={null}
									axisRight={null}
									axisBottom={{
										// TODO: Get it from theme
										tickSize: 0,
										tickPadding: 4,
										tickRotation: 0,
										format: (isoString): string =>
											dates?.length === 7 ? moment(isoString).format('dddd') : '',
									}}
									axisLeft={{
										// TODO: Get it from theme
										tickSize: 0,
										tickPadding: 4,
										tickRotation: 0,
										format: (hour): string =>
											moment()
												.set({ hour: parseInt(hour, 10), minute: 0, second: 0 })
												.format('LT'),
									}}
									hoverTarget='cell'
									animate={dates && dates.length <= 7}
									motionStiffness={90}
									motionDamping={15}
									theme={{
										// TODO: Get it from theme
										axis: {
											ticks: {
												text: {
													fill: '#9EA2A8',
													fontFamily:
														'Inter, -apple-system, system-ui, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Meiryo UI", Arial, sans-serif',
													fontSize: 10,
													fontStyle: 'normal',
													fontWeight: 600,
													letterSpacing: '0.2px',
													lineHeight: '12px',
												},
											},
										},
										tooltip: {
											container: {
												backgroundColor: '#1F2329',
												boxShadow:
													'0px 0px 12px rgba(47, 52, 61, 0.12), 0px 0px 2px rgba(47, 52, 61, 0.08)',
												borderRadius: 2,
											},
										},
									}}
									tooltip={({ value }): ReactElement => (
										<Box fontScale='p2' color='alternative'>
											{t('Value_users', { value })}
										</Box>
									)}
								/>
							</Box>
						</Box>
					</Flex.Item>
				</Box>
			) : (
				<Skeleton variant='rect' height={696} />
			)}
		</Section>
	);
};

export default UsersByTimeOfTheDaySection;
