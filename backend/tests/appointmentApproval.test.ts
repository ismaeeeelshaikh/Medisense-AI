jest.mock('../src/config/database', () => ({ prisma: { appointmentRequest: { findUnique: jest.fn(), update: jest.fn() }, user: { findUnique: jest.fn() } } }));
jest.mock('../src/config/socket', () => ({ emitAppointmentApproved: jest.fn(), emitAppointmentRequestCreated: jest.fn(), emitAppointmentCounterOffer: jest.fn(), emitPatientResponded: jest.fn() }));
jest.mock('../src/modules/notifications/notification.service', () => ({ notificationService: { create: jest.fn().mockResolvedValue(undefined) } }));

import { prisma } from '../src/config/database';
import { emitAppointmentApproved } from '../src/config/socket';
import { notificationService } from '../src/modules/notifications/notification.service';
import { appointmentRequestService } from '../src/modules/appointments/appointmentRequest.service';

const pendingRequest = {
    id: 'request-1', patientId: 'patient-1', doctorId: 'doctor-1',
    requestedDate: new Date('2026-10-21T00:00:00.000Z'), timeSlot: 'MORNING', status: 'PENDING',
    patient: { userId: 'patient-user-1', firstName: 'A', lastName: 'Patient' },
};

describe('appointment approval schedule', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (prisma.appointmentRequest.findUnique as jest.Mock).mockResolvedValue(pendingRequest);
        (prisma.appointmentRequest.update as jest.Mock).mockImplementation(({ data }) => Promise.resolve({ ...pendingRequest, ...data }));
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({ firstName: 'Doctor', lastName: 'One', specialization: 'General' });
    });

    it('persists and notifies with the selected local calendar date and exact time', async () => {
        const saved = await appointmentRequestService.approve('request-1', '2026-10-23', '16:30');
        expect(prisma.appointmentRequest.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'request-1' }, data: expect.objectContaining({
                scheduledDate: new Date('2026-10-23T00:00:00.000Z'), scheduledTime: '16:30', status: 'APPROVED',
            }),
        }));
        expect(saved.scheduledTime).toBe('16:30');
        expect(emitAppointmentApproved).toHaveBeenCalledWith('patient-user-1', 'doctor-1', expect.objectContaining({
            date: saved.scheduledDate, time: '16:30',
        }));
        expect(notificationService.create).toHaveBeenCalledWith('patient-user-1', expect.any(String), expect.stringContaining('2026-10-23 at 16:30'), 'SUCCESS', expect.any(Object));
    });

    it('leaves optional schedule values untouched when omitted', async () => {
        await appointmentRequestService.approve('request-1');
        expect(prisma.appointmentRequest.update).toHaveBeenCalledWith({
            where: { id: 'request-1' }, data: expect.not.objectContaining({ scheduledDate: expect.anything(), scheduledTime: expect.anything() }),
        });
    });

    it.each([
        ['2026-02-30', '10:00'], ['2026-10-23T00:00:00Z', '10:00'], ['2026-10-23', '24:00'], ['2026-10-23', '9:00'],
    ])('rejects invalid schedule %s %s', async (date, time) => {
        await expect(appointmentRequestService.approve('request-1', date, time)).rejects.toMatchObject({ statusCode: 400 });
        expect(prisma.appointmentRequest.update).not.toHaveBeenCalled();
    });

    it('rejects missing requests', async () => {
        (prisma.appointmentRequest.findUnique as jest.Mock).mockResolvedValue(null);
        await expect(appointmentRequestService.approve('missing')).rejects.toMatchObject({ statusCode: 404 });
    });

    it('rejects requests that are no longer pending', async () => {
        (prisma.appointmentRequest.findUnique as jest.Mock).mockResolvedValue({ ...pendingRequest, status: 'APPROVED' });
        await expect(appointmentRequestService.approve('request-1')).rejects.toMatchObject({ statusCode: 400 });
        expect(prisma.appointmentRequest.update).not.toHaveBeenCalled();
    });

    it('approves for patients without linked login accounts without attempting notification', async () => {
        (prisma.appointmentRequest.findUnique as jest.Mock).mockResolvedValue({ ...pendingRequest, patient: { ...pendingRequest.patient, userId: null } });
        await appointmentRequestService.approve('request-1', '2026-10-23', '10:00');
        expect(emitAppointmentApproved).not.toHaveBeenCalled();
        expect(notificationService.create).not.toHaveBeenCalled();
    });
});
