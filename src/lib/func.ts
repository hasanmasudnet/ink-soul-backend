// getting date time time
export const CombineDateWithTime = (date: string, time: string) => {
    try {
      const appointmentDate = new Date(date)
      const [timePart, period] = time.split(" ") 
      const [hours, minutes] = timePart.split(":").map(Number)

      if (isNaN(hours) || isNaN(minutes)) {
        throw new Error("Invalid time format")
      }
  
      let hoursIn24 = hours
  
      if (period.toUpperCase() === "AM") {
        if (hours === 12) {
          hoursIn24 = 0
        }
      } else {
        if (hours !== 12) {
          hoursIn24 += 12
        }
      }

      appointmentDate.setHours(hoursIn24, minutes, 0, 0)
  
      return appointmentDate
    } catch (error) {
      throw new Error(`Failed to parse time`)
    }
}
  