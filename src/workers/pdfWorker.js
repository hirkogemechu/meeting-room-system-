const { parentPort } = require('worker_threads');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create receipts directory if it doesn't exist
const receiptsDir = path.join(__dirname, '../../receipts');
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir, { recursive: true });
}

parentPort.on('message', async (data) => {
  const { booking, user, room, receiptId } = data;

  try {
    // Generate PDF
    const doc = new PDFDocument();
    const filename = `receipt_${receiptId}_${Date.now()}.pdf`;
    const filepath = path.join(receiptsDir, filename);

    // Create write stream
    const writeStream = fs.createWriteStream(filepath);
    doc.pipe(writeStream);

    // Add content to PDF
    // Header
    doc.fontSize(20).text('Meeting Room Booking Receipt', { align: 'center' }).moveDown();

    doc.fontSize(12).text(`Receipt ID: ${receiptId}`, { align: 'center' }).moveDown();

    // Line separator
    doc
      .strokeColor('#000000')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown();

    // Booking Details
    doc.fontSize(14).text('Booking Details', { underline: true }).moveDown();

    doc
      .fontSize(10)
      .text(`Booking ID: ${booking.id}`)
      .text(`Status: ${booking.status}`)
      .text(`Date: ${new Date(booking.createdAt).toLocaleString()}`)
      .moveDown();

    // Room Details
    doc.fontSize(14).text('Room Details', { underline: true }).moveDown();

    doc
      .fontSize(10)
      .text(`Room Name: ${room.name}`)
      .text(`Capacity: ${room.capacity} people`)
      .text(`Equipment: ${room.equipment ? room.equipment.join(', ') : 'None'}`)
      .moveDown();

    // Time Details
    doc.fontSize(14).text('Time Details', { underline: true }).moveDown();

    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    const duration = (endTime - startTime) / (1000 * 60 * 60); // hours

    doc
      .fontSize(10)
      .text(`Start Time: ${startTime.toLocaleString()}`)
      .text(`End Time: ${endTime.toLocaleString()}`)
      .text(`Duration: ${duration} hour(s)`)
      .moveDown();

    // User Details
    doc.fontSize(14).text('User Details', { underline: true }).moveDown();

    doc.fontSize(10).text(`Name: ${user.name}`).text(`Email: ${user.email}`).moveDown();

    // Footer
    doc
      .fontSize(8)
      .text('Thank you for using Meeting Room Management System', { align: 'center' })
      .text('This is a system generated receipt.', { align: 'center' })
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

    // Finalize PDF
    doc.end();

    // Wait for file to be written
    writeStream.on('finish', () => {
      parentPort.postMessage({
        success: true,
        filename,
        filepath,
      });
    });

    writeStream.on('error', (error) => {
      throw error;
    });
  } catch (error) {
    parentPort.postMessage({
      success: false,
      error: error.message,
    });
  }
});
