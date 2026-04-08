const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure receipts directory exists
const receiptsDir = path.join(__dirname, '../../receipts');
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir, { recursive: true });
}

class PDFService {
  async generateBookingReceipt(booking, user, room) {
    return new Promise((resolve, reject) => {
      const filename = `receipt_${booking.id}_${Date.now()}.pdf`;
      const filepath = path.join(receiptsDir, filename);

      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(filepath);

      doc.pipe(writeStream);

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('MeetingRoom Pro', { align: 'center' })
        .moveDown();

      doc.fontSize(16).text('Booking Receipt', { align: 'center' }).moveDown();

      // Receipt info
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Receipt ID: ${booking.id.substring(0, 8)}...`, { align: 'center' })
        .text(`Date: ${new Date().toLocaleString()}`, { align: 'center' })
        .moveDown();

      // Divider
      doc
        .strokeColor('#cccccc')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown();

      // Booking Details
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Booking Details', { underline: true })
        .moveDown();

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Booking ID: ${booking.id}`)
        .text(`Status: ${booking.status}`)
        .text(`Booked On: ${new Date(booking.createdAt).toLocaleString()}`)
        .moveDown();

      // Room Details
      doc.fontSize(14).font('Helvetica-Bold').text('Room Details', { underline: true }).moveDown();

      let equipmentText = 'None';
      if (room.equipment) {
        try {
          const equipment = JSON.parse(room.equipment);
          equipmentText = Array.isArray(equipment) ? equipment.join(', ') : room.equipment;
        } catch {
          equipmentText = room.equipment;
        }
      }

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Room Name: ${room.name}`)
        .text(`Capacity: ${room.capacity} people`)
        .text(`Equipment: ${equipmentText}`)
        .moveDown();

      // Time Details
      doc.fontSize(14).font('Helvetica-Bold').text('Schedule', { underline: true }).moveDown();

      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      const duration = (endTime - startTime) / (1000 * 60 * 60);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Start Time: ${startTime.toLocaleString()}`)
        .text(`End Time: ${endTime.toLocaleString()}`)
        .text(`Duration: ${duration} hour(s)`)
        .moveDown();

      // User Details
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('User Information', { underline: true })
        .moveDown();

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Name: ${user.name}`)
        .text(`Email: ${user.email}`)
        .moveDown();

      // Footer
      doc.moveDown();
      doc
        .strokeColor('#cccccc')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown();

      doc
        .fontSize(9)
        .font('Helvetica-Oblique')
        .text('Thank you for choosing MeetingRoom Pro!', { align: 'center' })
        .text('This is a system-generated receipt.', { align: 'center' })
        .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        resolve({ success: true, filename, filepath });
      });

      writeStream.on('error', (error) => {
        reject(error);
      });
    });
  }
}

module.exports = new PDFService();
